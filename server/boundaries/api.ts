import express, { Express, Request, Response, NextFunction } from 'express';
import { API, IncomingMessage, ServerResponse } from 'webpack-dev-middleware';
import { ValidationError } from 'yup';
import Controller from '../controllers/controller';
import { ErrorResponse } from '@shared/interfaces';
import ApiError, { NotFoundError } from '../utilities/errors';
import logger from './logger';
import path from 'path';

class Server {
  protected express: Express;
  protected devMiddleware?: API<IncomingMessage, ServerResponse>;

  constructor() {
    logger.info(`Launching ApiServer using Express`);
    this.express = express();
    this.express.use(express.json());
    this.express.use((request, _, next) => {
      logger.http(`Received ${request.method} request at ${request.path}`);
      next();
    });
    return this;
  }

  public registerController = (apiRoute: string, controller: Controller) => {
    logger.info(`Registered controller with route /api/${apiRoute}`);
    this.express.use(`/api/${apiRoute}`, controller.router);
  };

  public registerStatic = async (enableHmr = false) => {
    if (enableHmr) {
      const { default: webpack } = await import('webpack');
      const { default: webpackDevMiddleware } = await import('webpack-dev-middleware');
      const { default: webpackHotMiddleware } = await import('webpack-hot-middleware');
      const { default: webpackConfig } = await import('../../webpack.dev');
      const webpackCompiler = webpack({ ...webpackConfig });
      this.devMiddleware = webpackDevMiddleware(webpackCompiler, {
        publicPath: webpackConfig.output?.publicPath,
        stats: webpackConfig.stats,
      });
      this.express.use(this.devMiddleware);
      this.express.use(webpackHotMiddleware(webpackCompiler));
      this.express.get('/(.*)', async (request, response) => {
        const indexPath = `${webpackConfig.output?.path}/index.html`;
        const index = await webpackCompiler.outputFileSystem.readFile(indexPath, (error) => {
          logger.error('Error when serving HMR file').error(error?.stack);
        });
        response.type('text/html').send(index).end();
        logger.http(`Delivered app to ${request.ip}`);
      });
    } else {
      this.express.use(express.static(`${__dirname}/../../public`));
      this.express.get('/(.*)', (request, response) => {
        response.type('text/html').sendFile(path.resolve(`${__dirname}/../../public/index.html`));
        logger.http(`Delivered app to ${request.ip}`);
      });
    }
  };

  public registerApiCatch = () => {
    this.express.use('/(.*)', () => {
      throw new NotFoundError('Route not found');
    });
  };

  public registerErrorHandler = () => {
    this.express.use(
      (
        error: Error | ApiError | ValidationError,
        request: Request,
        response: Response<ErrorResponse>,
        // Must have `_: NextFunction` as Express identifies 4 parameter functions as Error handlers
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _: NextFunction
      ) => {
        const fullPath = request.originalUrl;
        logger.http(`Encountered ${error.name} in ${request.method} request to ${fullPath}`);
        let status = 500;
        if (error instanceof ApiError) {
          status = error.statusCode;
        } else if (error instanceof ValidationError) {
          status = 400;
        } else {
          logger
            .error(`Unexpected HTTP error during ${request.method} request to ${fullPath}`)
            .error(error.stack);
        }
        response.status(status).send({ name: error.name, message: error.message });
      }
    );
  };

  public listen = (port: number, hostname?: string) => {
    const server = this.express.listen(port, hostname ?? '0.0.0.0', () => {
      logger.info(`ApiServer running on port ${port}`);
      logger.info(`Listening for requests...`);
    });

    process.on('SIGINT', () => {
      logger.info('Closing ApiServer gracefully');
      this?.devMiddleware?.close((error) => {
        if (error) {
          logger.error('Unable to close development middleware gracefully').error(error.stack);
        }
      });
      server.close((error) => {
        if (error) {
          logger.error('Unable to close ApiServer gracefully').error(error.stack);
        }
      });
    });
    return server;
  };
}

export default new Server();
