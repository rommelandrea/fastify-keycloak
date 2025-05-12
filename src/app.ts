import { join } from 'node:path';
import AutoLoad, { type AutoloadPluginOptions } from '@fastify/autoload';
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

  void fastify.register(AutoLoad, {
    dir: join(import.meta.dirname, 'plugins', 'external'),
    ignorePattern: /.*.no-load\.js/,
    options: { ...opts },
    forceESM: true,
  });

  fastify.register(documentRoutes);
};

export default app;
export { app, options };
