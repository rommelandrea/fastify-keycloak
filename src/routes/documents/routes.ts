import { FastifyInstance } from 'fastify';
import { authz } from '../../auth.js';

export async function documentRoutes(fastify: FastifyInstance) {
  fastify.get('/documents', { onRequest: authz('read') }, async () => {
    return [{ id: 1, name: 'document.pdf' }];
  });

  fastify.post('/documents', { onRequest: authz('write') }, async () => {
    return { message: 'Document created' };
  });
}
