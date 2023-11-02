import express, { Express, NextFunction, Request, Response } from 'express';
import { Server as HttpServer } from 'http';
import { resolve } from 'path';
import { API, IncomingMessage, ServerResponse } from 'webpack-dev-middleware';
import { ValidationError } from 'yup';
import { Controller } from '../controllers/controller';
import { ErrorResponse } from '../controllers/interfaces/common';
import { ApiError, NotFoundError } from '../utilities/errors';
import { logger } from './logger';

export class Server {
  private express: Express;
  private server?: HttpServer;
  private devMiddleware?: API<IncomingMessage, ServerResponse>;

  constructor(...controllers: Controller[]) {
    this.express = express();
    this.express.use(express.json());

    this.registerLogger();
    for (const controller of controllers) {
      this.registerController(controller);
    }
    this.registerCatchAll();
    this.registerErrorHandler();

    return this;
  }

  public async listen(port: number, hostname?: string) {
    return new Promise<void>((resolve) => {
      this.server = this.express.listen(port, hostname ?? '0.0.0.0', () => {
        logger.info(`Listening for requests on port ${port}...`);
        resolve();
      });
    });
  }

  public async close() {
    return new Promise<void>((resolve, reject) => {
      logger.info(`Closing Server gracefully...`);
      this.server?.close((error) => {
        return error ? reject(error) : resolve();
      }) ?? resolve();
    });
  }

  public async registerStatic(enableHmr: boolean) {
    logger.info(`Enabling UI Delivery, HMR status: ${enableHmr}`);
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
        response.type('text/html').sendFile(resolve(`${__dirname}/../../public/index.html`));
        logger.debug(`Delivered app to ${request.ip}`);
      });
    }
  }

  private registerController(controller: Controller) {
    logger.info(`Registered controller with route /api${controller.path}`);
    this.express.use(`/api`, controller.router);
  }

  private registerLogger() {
    this.express.use((request, _, next) => {
      logger.http(`Received ${request.method} request at ${request.path}`);
      return next();
    });
  }

  private registerCatchAll() {
    this.express.use('/api/(.*)', () => {
      throw new NotFoundError('Route not found');
    });
  }

  private registerErrorHandler() {
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
          logger.error(
            `Unexpected HTTP error during ${request.method} request to ${fullPath}`,
            error
          );
        }
        response.status(status).send({ name: error.name, message: error.message }).end();
      }
    );
  }
}
