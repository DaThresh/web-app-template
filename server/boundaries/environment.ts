import dotenv from 'dotenv';
dotenv.config();

export type DatabaseEnvironment = {
  host: string;
  port: number;
  name: string;
  username: string;
  password: string;
};

export type Environment = {
  appName: string;
  port: number;
  logLevel: string;
  hotModuleReload: boolean;
  auth0: { tenantDomain: string; uiClientId: string };
  database: DatabaseEnvironment;
};

export const environment: Environment = {
  appName: 'api-template',
  port: +(process.env.PORT ?? 8080),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  hotModuleReload: process.env.HOT_MODULE_RELOAD == 'true',
  auth0: {
    tenantDomain: process.env.AUTH0_TENANT_DOMAIN ?? 'project.us.auth0.com',
    uiClientId: process.env.AUTH0_UI_CLIENT_ID ?? 'random-string',
  },
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: +(process.env.DATABASE_PORT ?? 3306),
    name: process.env.DATABASE_NAME ?? 'database',
    username: process.env.DATABASE_USERNAME ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? '',
  },
};
