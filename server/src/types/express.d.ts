import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { Document } from 'mongoose';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Extend Express Response to allow returning Response objects
declare module 'express' {
  interface Response {
    // This allows controllers to return the response object
    status(code: number): this;
    json(data: any): this;
    send(body: any): this;
  }
  
  // Extend RequestHandler to allow returning Response objects
  interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): void | Response | Promise<void | Response | undefined>;
  }

  // Fix for router.use middleware
  interface IRouterHandler<T> {
    (...handlers: RequestHandlerParams[]): T;
  }

  // Fix for router methods (get, post, put, delete)
  interface IRouterMatcher<T> {
    (path: PathParams, ...handlers: RequestHandlerParams[]): T;
  }

  // Fix for RequestHandlerParams
  type RequestHandlerParams<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    LocalsObj extends Record<string, any> = Record<string, any>
  > =
    | RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>
    | ErrorRequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>
    | Array<RequestHandler<P> | ErrorRequestHandler<P>>;
}

export {}; 