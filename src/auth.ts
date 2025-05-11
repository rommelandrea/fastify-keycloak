import { FastifyRequest, FastifyReply } from 'fastify';
import { authorizeWithKeycloak } from './kc.js';

export async function authz(scope: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ message: 'Missing or invalid token' });
    }

    const token = authHeader.replace('Bearer ', '');

    const allowed = await authorizeWithKeycloak(token, 'document', scope);
    if (!allowed) {
      return reply.status(403).send({ message: 'Access denied by Keycloak policy' });
    }
  };
}
