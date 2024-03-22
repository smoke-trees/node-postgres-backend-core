import { Format, Type } from "./types";

export interface DescriptionUrl {
  description: string;
  url: string;
}

export type ExternalDocumentation = DescriptionUrl;

export interface SchemaObject {
  type?: Type;
  format?: Format;
  oneOf?: SchemaObject[];
  allOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  not?: SchemaObject[];
  items?: SchemaObject;
  properties?: { [key: string]: SchemaObject };
  description?: string;
  default?: any;
  nullable?: boolean;
  readonly?: boolean;
  writeOnly?: boolean;
  example?: boolean | string | number | null;
  deprecated?: boolean;
  externalDocs?: ExternalDocumentation;
  $ref?: any;
  title?: string;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maxLength?: number;
  minLength?: number;
  maxItems?: number;
  minItems?: number;
  required?: string[];
  enum?: (string | number | any)[];
}

export const Schemas = {};

export interface Component {
  schemas?: { [key: string]: SchemaObject };
}
