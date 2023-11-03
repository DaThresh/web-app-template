import { Environment } from '../../../server/boundaries';

export const sampleEnvironment: Environment = {
  port: 8080,
  appName: 'Sample App',
  logLevel: 'info',
  hotModuleReload: false,
  auth0: { tenantDomain: 'https://test.auth0.com', uiClientId: 'random-string' },
  database: {
    host: 'localhost',
    port: 3306,
    name: 'database',
    username: 'username',
    password: 'password',
  },
};
