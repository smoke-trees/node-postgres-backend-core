import {
  Router as ExpressRouter,
  Request,
  Response,
  NextFunction,
} from "express";
import { Application } from "./app";
import log from "./log";
import { ErrorCode } from "./result";
import Router from "./RouteHandler";

// Methods Supported
export const enum Methods {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
  PATCH = "patch",
  OPTIONS = "options",
  HEAD = "head",
  ALL = "all",
}

export type Handler = (
  req: Request,
  res: Response,
  next?: NextFunction
) => void | Promise<void> | Promise<Response>;

// Route Handler
export interface Route {
  /**
   * Path on which the route will be mapped. The path is formed by
   * combining the controller path and the route path
   * @example /
   * @example /:id
   */
  path: string;
  /**
   * HTTP Method for the routes
   * @example GET
   * @example POST
   * @example PUT
   * @example DELETE
   * @example PATCH
   * @example OPTIONS
   * @example HEAD
   * @example ALL
   */
  method: Methods;
  /**
   * Middleware to be used for this routes
   * @example [authMiddleware]
   */
  localMiddleware: ((
    req: Request,
    res: Response,
    next: NextFunction
  ) => void)[];
  /**
   * Handler for the routes. Bind the class to the handler always to ensure this
   * is resolved always.
   * @example this.handler.bind(this)
   */
  handler: Handler;
}

export interface Controller {
  loadDocumentation?(): void | Promise<void>;
}

/**
 * Controller class which can be used to create routes and map them to the Server
 */
export abstract class Controller extends Router {
  /**
   * Path on which the controller will be mapped. The path is formed by
   * combining the controller path and the route path.
   * @example /api
   */
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
    super(ExpressRouter());
    this.app = app;
    this.setMiddleware();
    this.loadMiddleware();
    this.routes = [];
  }

  /**
   * Add routes to the controllers
   * @param routes Array of routes to be added to the controllers
   * @example this.addRoutes({ path: '/', method: Methods.GET, localMiddleware: [], handler: this.handler.bind(this) })
   * @example this.addRoutes({ path: '/:id', method: Methods.GET, localMiddleware: [], handler: this.handler.bind(this) })
   */
  addRoutes(...routes: Route[]) {
    this.routes = [...routes, ...this.routes];
  }

  /**
   * Add a wrapper around the handler to catch exceptions
   * This ensures the server always responds with an error
   */
  public handleException(handler: Handler) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await handler(req, res, next);
      } catch (error) {
        log.error("Error in controller", Controller.name, error, {});
        if (!res.headersSent) {
          res
            .status(500)
            .send({
              status: { error: true, code: ErrorCode.InternalServerError },
              message: "Internal Server Error",
              result: null,
            });
        }
      }
    };
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
          this.router.get(
            route.path,
            ...route.localMiddleware,
            this.handleException(route.handler)
          );
          break;
        case Methods.POST:
          this.router.post(
            route.path,
            ...route.localMiddleware,
            this.handleException(route.handler)
          );
          break;
        case Methods.PUT:
          this.router.put(
            route.path,
            ...route.localMiddleware,
            this.handleException(route.handler)
          );
          break;
        case Methods.DELETE:
          this.router.delete(
            route.path,
            ...route.localMiddleware,
            this.handleException(route.handler)
          );
          break;
        case Methods.PATCH:
          this.router.patch(
            route.path,
            ...route.localMiddleware,
            this.handleException(route.handler)
          );
          break;
        case Methods.HEAD:
          this.router.head(
            route.path,
            ...route.localMiddleware,
            this.handleException(route.handler)
          );
          break;
        case Methods.OPTIONS:
          this.router.options(
            route.path,
            ...route.localMiddleware,
            this.handleException(route.handler)
          );
          break;
        case Methods.ALL:
          this.router.all(
            route.path,
            ...route.localMiddleware,
            this.handleException(route.handler)
          );
          break;
        default:
        // Throw exception
      }
    }
    for (const controllers of this.controllers) {
      this.router.use(controllers.path, controllers.setRoutes());
      // Throw exception
    }
    // Return router instance (will be usable in Server class)
    return this.router;
  };
}
