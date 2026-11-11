import type { FastifyInstance } from 'fastify';

export default function (server: FastifyInstance) {
  server.get('/equipment-types', async (_, reply) => {
    const equipmentTypes = server.prisma.equipmentTypes.findMany();
    return reply.code(200).send(equipmentTypes);
  });
}
