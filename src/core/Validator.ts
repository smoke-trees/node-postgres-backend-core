import 'reflect-metadata'
export type ValidatorFunction = (value: any) => boolean;
export interface ValidatorOptions {
  /**
   * Validator function
   */
  validatorFunction?: ValidatorFunction;
  /**
   * Is the value required when creating
   */
  required?: boolean;
  /**
   * Is the value required when updating
   */
  updatable?: boolean;
}

export function defaultValidator(value: any): boolean {
  return true;
}

/**
 * Validate a value 
 * @param options Options for the validator
 * @returns 
 */
export function Validator(options?: ValidatorOptions) {
  const validatorOptions = options?.validatorFunction ?? defaultValidator
  const required = options?.required ?? false
  const updatable = options?.updatable ?? true
  return function (target: Object, propertyKey: string | symbol) {
    Reflect.defineMetadata(`smoke:${propertyKey.toString()}:validator`, validatorOptions, target)
    Reflect.defineMetadata(`smoke:${propertyKey.toString()}:required`, required, target)
    Reflect.defineMetadata(`smoke:${propertyKey.toString()}:updatable`, updatable, target)
  }
}