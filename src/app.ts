import { type AutoloadPluginOptions } from '@fastify/autoload';
import type { FastifyPluginAsync } from 'fastify';
import type { FastifyInstance } from 'fastify';
import type { FastifyPluginOptions } from 'fastify';
import { documentRoutes } from './routes/documents/routes.js';

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
): Promise<void> => {
  fastify.decorate('rootDir', import.meta.dirname);

  fastify.register(documentRoutes);

};

export default app;
export { app, options };
