import { Router, Request, Response, NextFunction } from 'express';
import { AnyObjectSchema } from 'yup';
import logger from '../boundaries/logger';

type method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

class Controller {
  public readonly router: Router;

  constructor() {
    this.router = Router();
  }

  public createEndpoint<
    RequestBody = never,
    ResponseBody = never,
    RequestQuery = never,
    RequestUrlVariables = never
  >(
    method: method,
    route: string,
    inputSchemas: { body?: AnyObjectSchema; query?: AnyObjectSchema; params?: AnyObjectSchema },
    callback: (
      request: Request<RequestUrlVariables, ResponseBody, RequestBody, RequestQuery>,
      response: Response<ResponseBody>,
      next?: NextFunction
    ) => void
  ) {
    this.router.use(
      route,
      async (
        request: Request<RequestUrlVariables, ResponseBody, RequestBody, RequestQuery>,
        response: Response<ResponseBody>,
        next: NextFunction
      ) => {
        logger.http(`${request.method} ${request.originalUrl}`);
        if (request.method === method) {
          inputSchemas.body?.validateSync(request.body);
          inputSchemas.query?.validateSync(request.query);
          inputSchemas.params?.validateSync(request.params);
          await callback(request, response, next);
        } else {
          next();
        }
      }
    );
  }
}

export default Controller;
