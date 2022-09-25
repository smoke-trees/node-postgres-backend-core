import { ExternalDocumentation, SchemaObject } from "./schema";

export class RequestParameters {
  in: 'query' | 'header' | 'path' | 'cookie';
  constructor(
    public name: string,
    In: 'query' | 'header' | 'path' | 'cookie',
    public description: string,
    public required: boolean,
    public schema: SchemaObject,
  ) {
    this.in = In
  }
}

export class RequestBody {
  constructor(
    public description: string,
    public content: {
      [key: string]: {
        schema: SchemaObject
      }
    }
  ) {
  }
}

export class ResponseObject {
  constructor(
    public description: string,
    public content: {
      [key: string]: {
        schema: SchemaObject
      }
    },
    public headers?: {
      [key: string]: {
        description: string;
        schema: SchemaObject
      }
    }
  ) {
  }
}


export interface Operation {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentation;
  operationId: string;
  parameters?: any[];
  requestBody?: RequestBody;
  responses?: { [key: string]: ResponseObject };
}

export interface Path {
  $ref?: string;
  summary?: string;
  description?: string;
  get?: Operation;
  put?: Operation;
  post?: Operation
  delete?: Operation;
  options?: Operation;
  head?: Operation;
  patch?: Operation;
}

export type Paths = {
  [key: string]: Path;
}

export const paths: Paths = {}


export function DocsRoute({
  path,
  method,
  summary,
  description,
  operationId,
  tags,
  parameters,
  requestBody,
  responses,
  externalDocs,
  appendId,
  basePath
}: {
  path?: string;
  method: 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch';
  summary?: string;
  description?: string;
  operationId: string;
  tags?: string[];
  parameters?: RequestParameters[];
  requestBody?: RequestBody;
  basePath?: string;
  appendId?: boolean;
  responses?: {
    [key: string]: ResponseObject
  };
  externalDocs?: ExternalDocumentation;
}) {
  return (target: any, propertyKey: string ) => {
    if (!path) {
      const obj = new target.constructor()
      path = `${target.path}${appendId ? '/{id}' : ''}`
    }
    if (!paths[path]) {
      paths[path] = {}
    }
    paths[path][method] = {
      summary,
      description,
      operationId,
      tags,
      parameters,
      requestBody,
      responses,
      externalDocs,
    }
  }
}