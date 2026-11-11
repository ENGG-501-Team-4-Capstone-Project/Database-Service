import { type FastifyInstance } from 'fastify';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import type { ChunkSearchResult, ManualChunksPayload, ManualSearchQuery, UploadManualPayload } from '../types/routes/manual.js';

export default function (server: FastifyInstance) {
  server.get<{ Params: { id: string } }>('/manual/:id', async (request, reply) => {
    const id = Number(request.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return reply.code(400).send({ error: 'Invalid manual id' });
    }

    const manual = await server.prisma.manuals.findUnique({
      where: { id },
      include: {
        manualChunks: {
          orderBy: { chunk_index: 'asc' }
        }
      }
    });

    if (!manual) {
      return reply.code(404).send({ error: 'Manual not found' });
    }

    return reply.code(200).send(manual);
  });

  server.post<{ Body: UploadManualPayload }>('/manual-meta-data', async (request, reply) => {
    const { equipment_type_id, title, manufacturer, version, file_path } = request.body;

    if (!Number.isSafeInteger(equipment_type_id) || equipment_type_id <= 0) {
      return reply.code(400).send({
        error: 'Invalid equipment_type_id'
      });
    }

    if (typeof title !== 'string' || !title.trim()) {
      return reply.code(400).send({
        error: 'Title is required'
      });
    }

    try {
      const manual = await server.prisma.manuals.create({
        data: {
          equipment_type_id,
          title: title.trim(),
          manufacturer,
          version,
          file_path
        }
      });

      return reply.code(201).send({ manualId: manual.id });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          return reply.code(400).send({
            error: 'Equipment type does not exist'
          });
        }

        if (error.code === 'P2002') {
          return reply.code(409).send({
            error: 'A manual with that unique value already exists'
          });
        }
      }

      throw error;
    }
  });

  server.post<{ Body: ManualChunksPayload }>('/manual-chunks', async (request, reply) => {
    const chunks = request.body.chunks;

    try {
      const inserted = await server.prisma.manualChunks.createMany({
        data: chunks
      });
      return reply.code(200).send({ inserted: inserted.count });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
        return reply.code(400).send({ error: 'One or more manual IDs do not exist' });
      }

      throw error;
    }
  });

  server.get<{
    Params: { id: string };
    Querystring: ManualSearchQuery;
  }>(
    '/manual/:id/search',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['query'],
          additionalProperties: false,
          properties: {
            query: {
              type: 'string',
              minLength: 2,
              maxLength: 200
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 20,
              default: 5
            }
          }
        }
      }
    },
    async (request, reply) => {
      const manualId = Number(request.params.id);
      const query = request.query.query.trim();
      const limit = request.query.limit ?? 5;

      if (!Number.isSafeInteger(manualId) || manualId <= 0) {
        return reply.code(400).send({
          error: 'Invalid manual id'
        });
      }

      if (query.length < 2) {
        return reply.code(400).send({
          error: 'Query must contain at least 2 characters'
        });
      }

      const manual = await server.prisma.manuals.findUnique({
        where: { id: manualId },
        select: {
          id: true,
          title: true
        }
      });

      if (!manual) {
        return reply.code(404).send({
          error: 'Manual not found'
        });
      }

      const results = await server.prisma.$queryRaw<ChunkSearchResult[]>`
      SELECT
        id AS chunk_id,
        page_number,
        chunk_index,
        chunk_text,
        ts_rank(
          to_tsvector('english', chunk_text),
          websearch_to_tsquery('english', ${query})
        ) AS relevance_score
      FROM manual_chunks
      WHERE manual_id = ${manualId}
        AND to_tsvector('english', chunk_text)
            @@ websearch_to_tsquery('english', ${query})
      ORDER BY relevance_score DESC, chunk_index ASC, id ASC
      LIMIT ${limit}
    `;

      return reply.code(200).send({
        manual_id: manual.id,
        title: manual.title,
        query,
        total_matches: results.length,
        results
      });
    }
  );
}
