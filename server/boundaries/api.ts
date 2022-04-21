import express, { Express, Request, Response, NextFunction } from 'express';
import { ValidationError } from 'yup';
import Controller from '../controllers/controller';
import { ErrorResponse } from '@shared/interfaces';
import ApiError, { NotFoundError, SetupError } from '../utilities/errors';
import logger from './logger';

abstract class Server {
  protected static app?: Express;

  public static init = (): Express => {
    if (Server.app) {
      throw new SetupError('Server already initialized');
    }

    Server.app = express();
    Server.app.use(express.json());
    return Server.app;
  };

  public static registerController = (apiRoute: string, controller: Controller) => {
    if (!Server.app) {
      throw new SetupError('Server not initialized');
    }

    Server.app.use(`/api/${apiRoute}`, controller.router);
  };

  public static registerStatic = async (enableHmr = false) => {
    if (!Server.app) {
      throw new SetupError('Server not initialized');
    }
    if (enableHmr) {
      const { default: webpack } = await import('webpack');
      const { default: webpackDevMiddleware } = await import('webpack-dev-middleware');
      const { default: webpackHotMiddleware } = await import('webpack-hot-middleware');
      const { default: webpackConfig } = await import('../../webpack.dev');
      const webpackCompiler = webpack({ ...webpackConfig });
      Server.app.use(
        webpackDevMiddleware(webpackCompiler, {
          publicPath: webpackConfig.output?.publicPath,
          stats: webpackConfig.stats,
        })
      );
      Server.app.use(webpackHotMiddleware(webpackCompiler));
      Server.app.get('/(.*)', (request: Request, response: Response) => {
        const indexPath = `${webpackConfig.output?.path}/index.html`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const index = (webpackCompiler.outputFileSystem as any).readFileSync(indexPath);
        response.type('text/html').send(index).end();
        logger.http(`Delivered app to ${request.ip}`);
      });
    } else {
      Server.app.use(express.static(`${__dirname}/../../public`));
      Server.app.get('/(.*)', (request: Request, response: Response) => {
        response.type('text/html').send(`${__dirname}/../../public/index.html`);
        logger.http(`Delivered app to ${request.ip}`);
      });
    }
  };

  public static registerApiCatch = () => {
    if (!Server.app) {
      throw new SetupError('Server not initialized');
    }

    Server.app.use('/api/(.*)', () => {
      throw new NotFoundError('Route not found');
    });
  };

  public static registerErrorHandler = () => {
    if (!Server.app) {
      throw new SetupError('Server not initialized');
    }

    Server.app.use(
      (
        error: Error | ApiError,
        request: Request,
        response: Response<ErrorResponse>,
        // Must have `_: NextFunction` as Express identifies 4 parameter functions as Error handlers
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _: NextFunction
      ) => {
        logger.error(
          `Encountered ${error.name} in ${request.method} request to ${request.originalUrl}`
        );
        let status = 500;
        if (error instanceof ApiError) {
          status = error.statusCode;
        } else if (error instanceof ValidationError) {
          status = 400;
        } else {
          logger.error(error);
        }
        response.status(status).send({ name: error.name, message: error.message });
      }
    );
  };

  public static listen = (port: number, hostname?: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!Server.app) {
        throw new SetupError('Server not initialized');
      }

      Server.app
        .listen(port, hostname ?? '0.0.0.0', () => logger.info(`App now listening on port ${port}`))
        .on('error', (error: Error) => reject(error));
    });
  };
}

export default Server;
