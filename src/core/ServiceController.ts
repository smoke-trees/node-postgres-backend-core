import { NextFunction, Request, Response } from "express";
import { ParsedQs } from "qs";
import { BaseEntity, BaseEntityConstructor, createEntity } from "./BaseEntity";
import { Service } from "./Service";
import { Application } from "./app";
import { Controller, Methods } from "./controller";
import { Documentation } from "./documentation/SmokeDocs";
import { ErrorCode, Result } from "./result";

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
  paths?: Partial<IPathsOptions>;
}

export type ILocalMiddleware = {
  [Property in keyof Partial<IPathsOptions>]: ((
    req: Request,
    res: Response,
    next: NextFunction
  ) => void)[];
};

export abstract class ServiceController<
  Entity extends BaseEntity,
> extends Controller {
  public service: Service<Entity>;
  private optionsPath: IServiceControllerPathOptions;
  private EntityConstructor: BaseEntityConstructor<Entity>;

  /**
   * Create a controller for a service which has basic crud routes available
   * @param app Application Instance
   * @param entityConstructor Entity Constructor
   * @param service Service to be used
   * @param options Options for the controller
   * @param localMiddlewares Local middlewares for each path
   */
  constructor(
    app: Application,
    entityConstructor: BaseEntityConstructor<Entity>,
    service: Service<Entity>,
    options?: IServiceControllerOptions,
    localMiddlewares?: ILocalMiddleware
  ) {
    super(app);
    this.service = service;
    this.optionsPath = {
      create: true,
      delete: true,
      read: true,
      readMany: true,
      readManyWithoutPagination: true,
      update: true,
      ...options?.paths,
    };
    this.EntityConstructor = entityConstructor;
    if (this.optionsPath.create) {
      this.addRoutes({
        handler: this.create.bind(this),
        localMiddleware: localMiddlewares?.create ?? [],
        method: Methods.POST,
        path: "/",
      });
    }
    if (this.optionsPath.readMany) {
      this.addRoutes({
        handler: this.readMany.bind(this),
        localMiddleware: localMiddlewares?.readMany ?? [],
        method: Methods.GET,
        path: "/",
      });
    }
    if (this.optionsPath.read) {
      this.addRoutes({
        handler: this.readById.bind(this),
        localMiddleware: localMiddlewares?.read ?? [],
        method: Methods.GET,
        path: "/:id",
      });
    }
    if (this.optionsPath.update) {
      this.addRoutes({
        handler: this.update.bind(this),
        localMiddleware: localMiddlewares?.update ?? [],
        method: Methods.PUT,
        path: "/:id",
      });
    }
    if (this.optionsPath.delete) {
      this.addRoutes({
        handler: this.delete.bind(this),
        localMiddleware: localMiddlewares?.delete ?? [],
        method: Methods.DELETE,
        path: "/:id",
      });
    }
  }

  parseReadManyQuery(query: ParsedQs) {
    const {
      orderBy,
      order,
      page,
      count,
      nonPaginated,
      fromCreatedDate,
      toCreatedDate,
      like,
      likeBehaviour,
      ...filter
    } = query;
    let pageNumberParsed = parseInt(page?.toString() ?? "1");
    let countParsed = parseInt(count?.toString() ?? "10");
    let fromCreatedDateDate;
    let toCreatedDateDate;

    let orderParsed: string = order?.toString()?.toUpperCase() ?? "DESC";

    if (isNaN(pageNumberParsed)) {
      pageNumberParsed = 1;
    }
    if (isNaN(countParsed)) {
      countParsed = 10;
    }
    if (orderParsed !== "DESC" && orderParsed !== "ASC") {
      orderParsed = "DESC";
    }
    if (fromCreatedDate) {
      fromCreatedDateDate = new Date(fromCreatedDate.toString());
      if (isNaN(fromCreatedDateDate.getTime())) {
        fromCreatedDateDate = undefined;
      }
    }
    if (toCreatedDate) {
      toCreatedDateDate = new Date(toCreatedDate.toString());
      toCreatedDateDate.setDate(toCreatedDateDate.getDate() + 1);
      if (isNaN(toCreatedDateDate.getTime())) {
        toCreatedDateDate = undefined;
      }
    }
    let nonPaginatedParsed;
    if (nonPaginated === "true" && this.optionsPath.readManyWithoutPagination) {
      nonPaginatedParsed = true;
    } else {
      nonPaginatedParsed = false;
    }

    return {
      pageNumberParsed,
      countParsed,
      orderParsed: orderParsed as "ASC" | "DESC",
      orderBy: orderBy?.toString() as keyof BaseEntity,
      filter: filter as any,
      fromCreatedDateDate,
      toCreatedDateDate,
      like: like as any,
      nonPaginated: nonPaginatedParsed,
    };
  }

  async readMany(req: Request, res: Response) {
    const {
      pageNumberParsed,
      countParsed,
      orderParsed,
      orderBy,
      filter,
      fromCreatedDateDate,
      toCreatedDateDate,
      like,
      nonPaginated,
    } = this.parseReadManyQuery(req.query);

    const result = await this.service.readMany({
      page: pageNumberParsed,
      count: countParsed,
      order: orderParsed as "ASC" | "DESC",
      field: orderBy?.toString() as keyof BaseEntity,
      where: filter as any,
      fromCreatedDate: fromCreatedDateDate,
      toCreatedDate: toCreatedDateDate,
      like: like as any,
      nonPaginated,
    });

    res.setHeader("X-Count", result.result?.length ?? 0);
    res.status(result.getStatus()).json(result);
  }

  async readById(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.service.readOne(id);
    res.status(result.getStatus()).json(result);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const entity = req.body;
    if (entity.validate) {
      const value = entity.validate(true, false, true);
      if (value.length > 0) {
        const result: Result<null> = new Result(
          true,
          ErrorCode.BadRequest,
          value.join(", "),
          null
        );
        res.status(result.getStatus()).json(result);
        return;
      }
    }
    const response = await this.service.update(id, entity as any);
    res.status(response.getStatus()).json(response);
  }

  async create(req: Request, res: Response) {
    const entity = createEntity<Entity>(this.EntityConstructor, req.body);
    const value = entity.validate(true, true, false);
    if (value.length > 0) {
      const result: Result<null> = new Result(
        true,
        ErrorCode.BadRequest,
        value.join(", "),
        null
      );
      res.status(result.getStatus()).json(result);
      return;
    }
    const response = await this.service.create(entity as any);
    res.status(response.getStatus()).json(response);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.service.delete(id);
    res.status(result.getStatus()).json(result);
  }

  async loadDocumentation() {
    if (this.optionsPath.create) {
      Documentation.addRoute({
        description: "Create a new entity",
        tags: [this.EntityConstructor.name],
        method: Methods.POST,
        path: `${this.path}`,
        requestBody: {
          $ref: Documentation.getRef(this.EntityConstructor),
        },
        responses: {
          "201": {
            description: "Created",
            value: {
              anyOf: [{ type: "string", format: "uuid" }, { type: "integer" }],
            },
          },
          "400": {
            description: "Bad Request",
            value: { $ref: Documentation.getRef(this.EntityConstructor) },
          },
        },
      })(this.EntityConstructor);
    }
    if (this.optionsPath.readMany) {
      Documentation.addRoute({
        description: "Read many entities",
        parameters: [
          {
            name: "orderBy",
            in: "query",
            description: "Order by which field",
            schema: { type: "string" },
          },
          {
            name: "order",
            in: "query",
            description: "Order: ASC or DESC",
            schema: { type: "string" },
          },
          {
            name: "page",
            in: "query",
            description: "Page number",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "count",
            in: "query",
            description: "Order by",
            schema: { type: "integer", minimum: 1, default: 10 },
          },
          {
            name: "likeBehaviour",
            in: "query",
            description: "Like command",
            schema: { type: "string", enum: ["or", "and"] },
          },
        ],
        method: Methods.GET,
        path: `${this.path}`,
        tags: [this.EntityConstructor.name],
        responses: {
          "200": {
            description: "OK",
            value: { $ref: Documentation.getRef(this.EntityConstructor) },
          },
        },
      })(this.EntityConstructor);
    }
    if (this.optionsPath.read) {
      Documentation.addRoute({
        description: "Read many entities",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Id to read",
            schema: { type: "string" },
          },
        ],
        tags: [this.EntityConstructor.name],
        method: Methods.GET,
        path: `${this.path}/{id}`,
        responses: {
          "200": {
            description: "OK",
            value: { $ref: Documentation.getRef(this.EntityConstructor) },
          },
          "404": {
            description: "Not found",
            value: { type: "object", example: null },
          },
        },
      })(this.EntityConstructor);
    }
    if (this.optionsPath.update) {
      Documentation.addRoute({
        description: "Update an entity",
        tags: [this.EntityConstructor.name],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Id to read",
            schema: { type: "string" },
          },
        ],
        requestBody: { $ref: Documentation.getRef(this.EntityConstructor) },
        method: Methods.PUT,
        path: `${this.path}/{id}`,
        responses: {
          "200": {
            description: "OK",
            value: { type: "integer", description: "Count of object updated" },
          },
          "404": {
            description: "Not found",
            value: { type: "object", example: null },
          },
        },
      })(this.EntityConstructor);
    }
    if (this.optionsPath.delete) {
      Documentation.addRoute({
        description: "Delete an entity",
        tags: [this.EntityConstructor.name],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Id to read",
            schema: { type: "string" },
          },
        ],
        method: Methods.DELETE,
        path: `${this.path}/{id}`,
        responses: {
          "200": {
            description: "OK",
            value: { type: "integer", description: "Count of objects deleted" },
          },
          "404": {
            description: "Not found",
            value: { type: "object", example: null },
          },
        },
      })(this.EntityConstructor);
    }
  }
}
