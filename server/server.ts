import Server from './boundaries/api';
import AppDB from './boundaries/database';
import { MissingEnvironmentError } from './utilities/errors';
import { whichEnv } from './boundaries/env';

if (
  !process.env.DATABASE_HOST ||
  !process.env.DATABASE_NAME ||
  !process.env.DATABASE_USERNAME ||
  !process.env.DATABASE_PASSWORD ||
  !process.env.DATABASE_PORT
) {
  throw new MissingEnvironmentError('Database variables not present');
}
AppDB.connect({
  host: String(process.env.DATABASE_HOST),
  name: String(process.env.DATABASE_NAME),
  username: String(process.env.DATABASE_USERNAME),
  password: String(process.env.DATABASE_PASSWORD),
  port: Number(process.env.DATABASE_PORT),
}).then(async () => {
  Server.init();
  // Register controllers here
  Server.registerApiCatch();
  Server.registerErrorHandler();
  await Server.registerStatic(whichEnv() === 'sandbox');

  if (!process.env.PORT) {
    throw new MissingEnvironmentError('Port not provided for API');
  }
  await Server.listen(Number(process.env.PORT));
});
