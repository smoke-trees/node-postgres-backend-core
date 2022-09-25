import { Router as ExpressRouter, Request, Response, NextFunction } from 'express'
import { Application } from './app'
import log from './log';
import { ErrorCode } from './result';
import Router from './RouteHandler'

// Methods Supported
export const enum Methods {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  PATCH = 'patch',
  OPTIONS = 'options',
  HEAD = 'head',
  ALL = 'all'
}

// Route Handler
export interface Route {
  path: string;
  method: Methods;
  localMiddleware: ((req: Request, res: Response, next: NextFunction) => void)[];
  handler: (req: Request, res: Response, next: NextFunction) => void | Promise<void>;
}

// Controller Class
export abstract class Controller extends Router {
  // Router instance for mapping routes
  // The path on which this.routes will be mapped
  public abstract path: string;
  // Array of objects which implement IRoutes interface
  private routes: Array<Route>;

  protected readonly app: Application;

  protected abstract controllers: Controller[];

  /**
   * Creates a Controller which can be used to map routes 
   * @param app Application instance
   */
  constructor(app: Application) {
    super(ExpressRouter())
    this.app = app
    this.setMiddleware()
    this.loadMiddleware()
    this.routes = []
  }

  addRoutes(...routes: Route[]) {
    this.routes = [...routes, ...this.routes]
  }

  private handleException(handler: (req: Request, res: Response, next: NextFunction) => Promise<void> | void) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await handler(req, res, next)
      } catch (error) {
        log.error("Error in controller", Controller.name, error, {})
        if (!res.headersSent) {
          res.status(500).send({ status: { error: true, code: ErrorCode.InternalServerError }, message: "Internal Server Error", result: null })
        }
      }
    }

  }
  /**
   * Loads all the routes added to the controller 
   * @returns Returns the express router
   */
  public setRoutes = (): ExpressRouter => {
    // Set HTTP method, middleware, and handler for each route
    // Returns Router object, which we will use in Server class
    for (const route of this.routes) {
      switch (route.method) {
        case Methods.GET:
          this.router.get(route.path, ...route.localMiddleware, this.handleException(route.handler))
          break
        case Methods.POST:
          this.router.post(route.path, ...route.localMiddleware, this.handleException(route.handler))
          break
        case Methods.PUT:
          this.router.put(route.path, ...route.localMiddleware, this.handleException(route.handler))
          break
        case Methods.DELETE:
          this.router.delete(route.path, ...route.localMiddleware, this.handleException(route.handler))
          break
        case Methods.PATCH:
          this.router.patch(route.path, ...route.localMiddleware, this.handleException(route.handler))
          break
        case Methods.HEAD:
          this.router.head(route.path, ...route.localMiddleware, this.handleException(route.handler))
          break
        case Methods.OPTIONS:
          this.router.options(route.path, ...route.localMiddleware, this.handleException(route.handler))
          break
        case Methods.ALL:
          this.router.all(route.path, ...route.localMiddleware, this.handleException(route.handler))
          break
        default:
        // Throw exception
      }
    }
    for (const controllers of this.controllers) {
      this.router.use(controllers.path, controllers.setRoutes())
      // Throw exception
    }
    // Return router instance (will be usable in Server class)
    return this.router
  };
  // public abstract loadDocumentation(): void;
}
