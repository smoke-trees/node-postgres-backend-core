import 'reflect-metadata'
import { paths } from './path';
import { ExternalDocumentation, Schemas } from "./schema";

export interface IContact {
  name?: string;
  url?: string;
  email?: string;
}

export interface ILicense {
  name?: string;
  url?: string
}

export interface IInfoObject {
  title: string;
  description: string;
  termsOfService?: string;
  contact?: IContact;
  license?: ILicense;
  version?: string;
}

export interface Tags {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentation
}
export interface ServerVariableObject {
  enum: string[];
  default: string
  description: string;

}
export interface ServerObject {
  url: string;
  description?: string;
  variables?: ServerVariableObject[];
}

let documentation: any = {}

export function OpenApi({ openapi = '3.0.1', info,
  servers, tags, basePath = '/' }:
  {
    openapi: string, info?: IInfoObject, tags?: Tags[], servers?: ServerObject[],
    externalDocs?: ExternalDocumentation, security?: any[], basePath?: string
  }) {
  const schemas = Reflect.getMetadata(`smoke-docs:schemas`, Schemas)
  console.log('openapi', schemas)
  return function (target: any) {
    documentation = {
      openapi,
      info,
      tags,
      servers,
      components: {
        schemas
      },
      paths
    }
    Reflect.defineMetadata(`smoke-docs:openapi`, documentation, target)
  }
}
export function GetApiDocumentation(target: any) {
  return JSON.stringify(Reflect.getMetadata(`smoke-docs:openapi`, target))
}