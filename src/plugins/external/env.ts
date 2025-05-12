import env from '@fastify/env';
import fp from 'fastify-plugin';

export interface EnvKeycloak {
  KC_CLIENT_ID: string;
  KC_CLIENT_SECRET: string;
  KC_REALM: string;
  KC_AUTH_SERVER_URL: string;
}

export interface EnvConfig extends EnvKeycloak {
  LOG_LEVEL: string;
  RATE_LIMIT_MAX: number;
}

declare module 'fastify' {
  export interface FastifyInstance {
    config: EnvConfig;
  }
}

const keys: Record<
  string,
  {
    type: 'number' | 'string' | 'boolean';
    default?: number | string | boolean;
    required: boolean;
  }
> = {
  LOG_LEVEL: {
    type: 'string',
    default: 'debug',
    required: false,
  },
  RATE_LIMIT_MAX: {
    type: 'number',
    default: 100,
    required: false,
  },
  KC_CLIENT_ID: {
    type: 'string',
    required: true,
  },
  KC_CLIENT_SECRET: {
    type: 'string',
    required: true,
  },
  KC_REALM: {
    type: 'string',
    required: true,
  },
  KC_AUTH_SERVER_URL: {
    type: 'string',
    required: true,
  },
};

const allKeys = Object.keys(keys);
const required = allKeys.filter((keyName) => keys[keyName].required);
const properties = allKeys.reduce(
  (
    accumulator: Record<
      string,
      { type: string; default?: number | boolean | string }
    >,
    key: string,
  ) => {
    accumulator[key] = { type: keys[key].type, default: keys[key].default };

    return accumulator;
  },
  {},
);

const schema = {
  type: 'object',
  required,
  properties,
};

export const autoConfig = {
  // Decorate Fastify instance with `config` key
  // Optional, default: 'config'
  confKey: 'config',

  // Schema to validate
  schema,

  // Needed to read .env in root folder
  dotenv: true,
  // or, pass config options available on dotenv module
  // dotenv: {
  //   path: `${import.meta.dirname}/.env`,
  //   debug: true
  // }

  // Source for the configuration data
  // Optional, default: process.env
  data: process.env,
};

/**
 * This plugins helps to check environment variables.
 *
 * @see {@link https://github.com/fastify/fastify-env}
 */
export default fp(env, {
  name: 'env',
});
