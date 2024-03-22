import "reflect-metadata";
import { ExternalDocumentation } from "./schema";

export interface IContact {
  name?: string;
  url?: string;
  email?: string;
}

export interface ILicense {
  name?: string;
  url?: string;
}

export interface IInfoObject {
  title: string;
  description: string;
  termsOfService?: string;
  contact?: IContact;
  license?: ILicense;
  version?: string;
}

export interface Tag {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentation;
}
export interface ServerVariableObject {
  enum: string[];
  default: string;
  description: string;
}
export interface ServerObject {
  url: string;
  description?: string;
  variables?: ServerVariableObject[];
}
