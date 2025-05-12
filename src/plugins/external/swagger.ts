import fs from 'fs';
import { join } from 'path';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { writeFile } from 'fs/promises';
import { getPackageInfo } from '../../utils/get-package-info.js';

export default fp(
  async (fastify: FastifyInstance, opts: FastifyPluginAsync) => {
    // Have to register the two plugins in the same file
    // because swaggerUi is dependent on Swagger
    await fastify.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Trigenia Badge API',
          description: 'API for Trigenia Fastify Badge service',
          version: (await getPackageInfo()).version,
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      ...opts,
    });
    const logoPath = join(fastify.rootDir, 'public', 'logo.png');
    let logoContent: Buffer | undefined;

    if (fs.existsSync(logoPath)) {
      logoContent = Buffer.from(
        fs.readFileSync(logoPath).toString('base64'),
        'base64',
      );
    }

    fastify.register(fastifySwaggerUi, {
      routePrefix: '/docs',
      logo: logoContent
        ? { type: 'image/png', content: logoContent }
        : undefined,
      ...opts,
    });

    try {
      fastify.addHook('onReady', async () => {
        await writeFile(
          join(fastify.rootDir, 'openapi-definition.yml'),
          fastify.swagger({ yaml: true }),
        );
      });
    } catch (e) {
      fastify.log.warn(e, 'Error writing open api definition file');
    }
  },
  { name: 'fastifySwagger' },
);
