import 'dotenv/config';
import { prismaPlugin } from './plugins/prisma.js';
import Fastify from 'fastify';

const envToLogger = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  },
  production: true,
  test: false
};

const fastify = Fastify({
  logger: envToLogger[process.env.NODE_ENV as keyof typeof envToLogger] ?? true
});

await fastify.register(prismaPlugin);

fastify.get('/health', async (_request, reply) => {
  try {
    await fastify.prisma.$queryRaw`SELECT 1`;
    return reply.code(200).send({ message: 'ok', db: 'connected' });
  } catch (error) {
    fastify.log.error({ err: error }, 'Prisma health check failed');
    return reply.code(503).send({ message: 'error', db: 'disconnected' });
  }
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    fastify.close().catch((error) => {
      fastify.log.error(error);
      process.exitCode = 1;
    });
  });
}

fastify.get('/test', async (_request, reply) => {
  return reply.code(200).send('Hello World');
});

fastify.listen({ port: Number(process.env.PORT ?? 3001), host: '0.0.0.0' }, (error) => {
  if (error) {
    fastify.log.error(error);
    process.exit(1);
  }
});
