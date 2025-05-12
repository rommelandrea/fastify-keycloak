/**
 * This file is here only to show you how to proceed if you would
 * like to run your application as a standalone executable.
 *
 * You can launch it with the command `npm run standalone`
 */

import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify from 'fastify';
import fp from 'fastify-plugin';

// Import library to exit fastify process, gracefully (if possible)
import closeWithGrace from 'close-with-grace';

// Import your application as a normal plugin.
import serviceApp from './app.js';

type LoggerEnvironment = 'development' | 'production' | 'test';

const envToLogger: Record<LoggerEnvironment, boolean | object> = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  production: true,
  test: false,
};

const environment = (process.env.NODE_ENV ??
  'development') as LoggerEnvironment;

const app = Fastify({
  logger: envToLogger[environment] ?? true,
  ajv: {
    customOptions: {
      coerceTypes: 'array',
      removeAdditional: 'all',
    },
  },
}).withTypeProvider<TypeBoxTypeProvider>();

async function init() {
  // Register your application as a normal plugin.
  // fp must be used to override default error handler
  app.register(fp(serviceApp));

  // Delay is the number of milliseconds for the graceful close to finish
  closeWithGrace(
    {
      delay: process.env.FASTIFY_CLOSE_GRACE_DELAY ?? 500,
    },
    async ({ err }) => {
      if (err != null) {
        app.log.error(err);
      }

      await app.close();
    },
  );

  await app.ready();

  try {
    // Start listening.
    const port = process.env.PORT ?? 3000;
    app.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

init();
