import path from "path";
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
  example?: boolean;
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

export function DocsSchema({ type = "object", description }: Partial<SchemaObject>) {
  return function (target: Function) {
    let schema = Reflect.getMetadata(`smoke-docs:schema:${target.name}`, target) as any ?? {} as any;
    schema = { ...schema, description, type }
    Reflect.defineMetadata(`smoke-docs:schema:${target.name}`, schema, target);

    let refs = Reflect.getMetadata(`smoke-docs:schemas:refs`, target) as any ?? {} as any;
    refs = { ...refs, [target.name]: `#/components/schemas/${target.name}` }
    Reflect.defineMetadata(`smoke-docs:schemas:ref`, refs, Schemas);

    console.log({ Schemas })
    let schemas = Reflect.getMetadata(`smoke-docs:schemas`, Schemas) as any ?? {} as any;
    schemas = { ...schemas, [target.name]: { ...(schemas?.[target.name] ?? {}) , type, description } }
    Reflect.defineMetadata(`smoke-docs:schemas`, schemas, Schemas);
    console.log(Reflect.getMetadata(`smoke-docs:schemas`, Schemas) as any ,'123')
  }
}

export function DocsField(data: SchemaObject) {
  return function (target: Object, propertyKey: string | symbol) {
    let schema = Reflect.getMetadata(`smoke-docs:schema:${target.constructor.name}`, target.constructor) as any ?? {} as any;
    schema.properties = schema.properties || {};
    schema.properties[propertyKey] = data;
    Reflect.defineMetadata(`smoke-docs:schema:${target.constructor.name}`, schema, target.constructor);

    let schemas = Reflect.getMetadata(`smoke-docs:schemas`, Schemas) as any ?? {} as any;
    schemas = { ...schemas, [target.constructor.name]: { ...(schemas?.[target.constructor.name] ?? {}), ...schema   } }
    console.log(schemas,'12123asf3')
    Reflect.defineMetadata(`smoke-docs:schemas`, schemas, Schemas);
  }
}

export function getSchema(target: Function): SchemaObject {
  let schema = Reflect.getMetadata(`smoke-docs:schema:${target.name}`, target) as any;
  return schema;
}
export function getRef(target: Function): SchemaObject {
  let refs = Reflect.getMetadata(`smoke-docs:schemas:ref`, Schemas) as any;
  return refs[target.name];
}
