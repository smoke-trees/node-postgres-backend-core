import { NextFunction, Request, Response } from 'express';
import { Application } from "./app";
import { BaseEntity, BaseEntityConstructor, createEntity } from "./BaseEntity";
import { Controller, Methods, Route } from './controller';
import { ErrorCode, Result } from './result';
import { Service } from "./Service";

export interface IServiceControllerPathOptions {
  read: boolean;
  readMany: boolean;
  readManyWithoutPagination: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface IPathsOptions {
  // [key: string]: boolean;
  read: boolean;
  readMany: boolean;
  readManyWithoutPagination: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface IServiceControllerOptions {
  paths?: Partial<IPathsOptions>
}

export type ILocalMiddleware = {
  [Property in keyof Partial<IPathsOptions>]: ((req: Request, res: Response, next: NextFunction) => void)[];
}

export abstract class ServiceController<Entity extends BaseEntity> extends Controller {
  protected routes: Route[];
  public service: Service<Entity>;
  private optionsPath: IServiceControllerPathOptions;
  private EntityConstructor: BaseEntityConstructor<Entity>

  /**
   * Create a controller for a service which has basic crud routes available 
   * @param app Application Instance
   * @param entityConstructor Entity Constructor
   * @param service Service to be used
   * @param options Options for the controller
   * @param localMiddlewares Local middlewares for each path
   */
  constructor(app: Application, entityConstructor: BaseEntityConstructor<Entity>, service: Service<Entity>, options?: IServiceControllerOptions, localMiddlewares?: ILocalMiddleware) {
    super(app)
    this.service = service
    this.optionsPath = {
      create: true,
      delete: true,
      read: true,
      readMany: true,
      readManyWithoutPagination: true,
      update: true,
      ...options?.paths
    }
    this.EntityConstructor = entityConstructor
    this.routes = []
    if (this.optionsPath.create) {
      this.routes.push({
        handler: this.create.bind(this),
        localMiddleware: localMiddlewares?.create ?? [],
        method: Methods.POST,
        path: '/'
      })
    }
    if (this.optionsPath.readMany) {
      this.routes.push({
        handler: this.readAll.bind(this),
        localMiddleware: localMiddlewares?.readMany ?? [],
        method: Methods.GET,
        path: '/'
      })
    }
    if (this.optionsPath.read) {
      this.routes.push({
        handler: this.readById.bind(this),
        localMiddleware: localMiddlewares?.read ?? [],
        method: Methods.GET,
        path: '/:id'
      })
    }
    if (this.optionsPath.update) {
      this.routes.push({
        handler: this.update.bind(this),
        localMiddleware: localMiddlewares?.update ?? [],
        method: Methods.PUT,
        path: '/:id'
      })
    }
    if (this.optionsPath.delete) {
      this.routes.push({
        handler: this.delete.bind(this),
        localMiddleware: localMiddlewares?.delete ?? [],
        method: Methods.DELETE,
        path: '/:id'
      })
    }
  }


  async readAll(req: Request, res: Response) {
    const { orderBy, order, page, count, nonPaginated, ...filter } = req.query
    let pageNumberParsed = parseInt(page?.toString() ?? '1')
    let countParsed = parseInt(count?.toString() ?? '10')
    if (isNaN(pageNumberParsed)) {
      pageNumberParsed = 1
    }
    if (isNaN(countParsed)) {
      countParsed = 10
    }
    let orderParsed: string = order?.toString()?.toUpperCase() ?? "DESC"
    if (orderParsed !== 'DESC' && orderParsed !== 'ASC') {
      orderParsed = 'DESC'
    }
    let result
    if (nonPaginated?.toString() === 'true') {
      result = await this.service.readManyWithoutPagination(orderParsed as 'ASC' | "DESC", orderBy?.toString() as keyof Entity, filter as any)
    } else {
      result = await this.service.readMany(pageNumberParsed, countParsed, orderParsed as 'ASC' | "DESC", orderBy?.toString() as keyof Entity, filter as any)
    }
    res.setHeader("X-Count", result.result?.length ?? 0)
    res.status(result.getStatus()).json(result)
  }

  async readById(req: Request, res: Response) {
    const { id } = req.params
    const result = await this.service.readOne(id)
    res.status(result.getStatus()).json(result)
  }

  async update(req: Request, res: Response) {
    const { id } = req.params
    const entity = createEntity<Entity>(this.EntityConstructor, req.body)
    const value = entity.validate(true, false, true)
    if (value.length > 0) {
      const result: Result<null> = new Result(
        true,
        ErrorCode.BadRequest,
        value.join(', '),
        null
      )
      res.status(result.getStatus()).json(result)
      return
    }
    const response = await this.service.update(id, entity as any)
    res.status(response.getStatus()).json(response)
  }

  async create(req: Request, res: Response) {
    const entity = createEntity<Entity>(this.EntityConstructor, req.body)
    const value = entity.validate(true, true, false)
    if (value.length > 0) {
      const result: Result<null> = new Result(
        true,
        ErrorCode.BadRequest,
        value.join(', '),
        null
      )
      res.status(result.getStatus()).json(result)
      return
    }
    const response = await this.service.create(entity as any)
    res.status(response.getStatus()).json(response)
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params
    const result = await this.service.delete(id)
    res.status(result.getStatus()).json(result)
  }
}