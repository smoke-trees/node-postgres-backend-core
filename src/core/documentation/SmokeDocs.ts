import "reflect-metadata";
import { Methods } from "../controller";
import { IInfoObject, ServerObject, Tag } from "./open-api";
import {
  IRequestParameter,
  IResponseObject,
  Path,
  Paths,
  RequestBody,
} from "./path";
import { SchemaObject } from "./schema";

export class SmokeDocs {
  public refs: { [key: string]: string };
  public schemas: { [key: string]: SchemaObject };
  public tags: Tag[] = [];
  public openapi: string = "3.0.1";
  public basePath: string = "/";
  public servers: ServerObject[] = [];
  public info: IInfoObject = { description: "", title: "" };
  public paths: { [key: string]: Paths } = {};
  private enabled = true;

  constructor() {
    this.refs = {};
    this.schemas = {};
  }
  public disableDocumentation() {
    this.enabled = false;
  }
  public enableDocumentation() {
    this.enabled = true;
  }

  setBasePath(path: string) {
    this.basePath = path;
  }

  setOpenApiVersion(version: string) {
    this.openapi = version;
  }

  addSchema(data: Partial<SchemaObject>) {
    return (target: Function) => {
      if (!this.enabled) {
        return;
      }
      const schema =
        Reflect.getMetadata("smoke:schema", target) ?? ({} as SchemaObject);
      const copy = this.createDeepCopy(schema);
      this.schemas[target.name] = copy;
      this.refs[target.name] = `#/components/schemas/${target.name}`;
    };
  }

  public addField(data: SchemaObject) {
    return (target: Object, propertyKey: string) => {
      if (!this.enabled) {
        return;
      }
      this.refs[target.constructor.name] =
        `#/components/schemas/${target.constructor.name}`;
      const schema =
        Reflect.getMetadata("smoke:schema", target.constructor) ?? {};
      const copy = this.createDeepCopy(schema);
      copy.properties = copy.properties || {};
      copy.properties[propertyKey] = data;
      Reflect.defineMetadata(`smoke:schema`, copy, target.constructor);
    };
  }

  public getRef(target: Function | string): string {
    let name;
    if (typeof target === "string") {
      name = target;
    } else {
      name = target.name;
    }
    return this.refs[name];
  }

  public getSchema(target: Function | string): SchemaObject {
    if (!this.enabled) {
      return {} as SchemaObject;
    }
    let name;
    if (typeof target === "string") {
      name = target;
    } else {
      name = target.name;
    }
    return this.schemas[name];
  }

  public addTags(tags: Tag[]) {
    this.tags.push(...tags);
  }
  public addServers(servers: ServerObject[]) {
    this.servers.push(...servers);
  }
  public addInfo(info: IInfoObject) {
    this.info = info;
  }

  public addRoute(data: {
    path: string;
    method: Methods;
    tags?: string[];
    requestBody?: SchemaObject;
    requestBodyDescription?: string;
    parameters?: IRequestParameter[];
    description?: string;
    operationId?: string;
    summary?: string;
    responses: {
      [key: string]: { description: string; value: SchemaObject };
    };
    responseHeaders?: {
      [key: string]: {
        description: string;
        schema: SchemaObject;
      };
    };
  }) {
    return (target?: Object | Function, operationId?: string) => {
      if (!this.enabled) {
        return {};
      }
      let name;
      if (target?.constructor) {
        name = target.constructor.name;
      } else if (target instanceof Function) {
        name = target.name;
      }

      this.paths[data.path] = this.paths[data.path] ?? ({} as Path);
      this.paths[data.path][data.method] = {
        operationId:
          data.operationId ||
          operationId ||
          `${name ?? ""}_${data.method}_${data.parameters?.length}}`,
        description: data.description,
        parameters: data.parameters,
        tags: data.tags,
        requestBody: data.requestBody
          ? new RequestBody(
              { "application/json": { schema: data.requestBody } },
              data.requestBodyDescription
            )
          : undefined,
        responses: Object.keys(data.responses).reduce(
          (acc, it) => {
            acc[it] = {
              description: data.responses[it].description,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: {
                        type: "object",
                        description: "Status of the response",
                        properties: {
                          code: {
                            type: "string",
                            description: "Status code of the response",
                            example: it,
                          },
                          error: {
                            type: "boolean",
                            description: "If the response is an error",
                            example: it.toString().startsWith("2")
                              ? false
                              : true,
                          },
                        },
                      },
                      message: {
                        type: "string",
                        description: "Message of the response",
                        example: it.toString().startsWith("2")
                          ? "Success"
                          : "Error",
                      },
                      result: data.responses[it].value,
                    },
                  },
                },
              },
            };
            return acc;
          },
          {} as { [key: string]: IResponseObject }
        ),
      };
    };
  }

  getAPIJson() {
    return {
      openapi: this.openapi,
      servers: this.servers,
      info: this.info,
      tags: this.tags,
      paths: this.paths,
      components: {
        schemas: this.schemas,
      },
    };
  }
  private createDeepCopy<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
  }
}

export const Documentation = new SmokeDocs();
