import { Methods } from "../controller";
import { ExternalDocumentation, SchemaObject } from "./schema";

export type IRequestParameter = {
  in: 'query' | 'header' | 'path' | 'cookie';
  name: string;
  description?: string;
  required?: boolean
  schema?: SchemaObject;
}

export class RequestParameters {
  in: 'query' | 'header' | 'path' | 'cookie';
  constructor(
    public name: string,
    In: 'query' | 'header' | 'path' | 'cookie',
    public description?: string,
    public required?: boolean,
    public schema?: SchemaObject,
  ) {
    this.in = In
  }
}

export class RequestBody {
  constructor(
    public content: {
      [key: string]: {
        schema: SchemaObject | undefined
      }
    },
    public description?: string,
  ) {
  }
}

export interface IResponseObject {
  content: {
    [key: string]: {
      schema: SchemaObject
    }
  }
  description?: string,
  headers?: {
    [key: string]: {
      description: string;
      schema: SchemaObject
    }
  }
}


export interface Operation {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentation;
  operationId: string;
  parameters?: IRequestParameter[];
  requestBody?: RequestBody;
  responses?: { [key: string]: IResponseObject };
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

export type Paths = Partial<Record<Methods, Operation | undefined>>