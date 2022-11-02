import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export interface BaseEntityConstructor<T> {
  new(data?: any): T;
}

/**
 * Create a entity object for a constructor 
 * @param ctor Constructor of the class
 * @param data Data to be used to create the object
 * @returns Entity Object
 */
export function createEntity<T>(ctor: BaseEntityConstructor<T>, data: any) {
  return new ctor(data);
}

/**
 * @class BaseEntity
 */
export class BaseEntity {
  id!: string | number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  constructor(data?: any) {
    if (data) {
      if (data.id) {
        this.id = data.id
      }
      if (!isNaN(data.updatedAt)) {
        this.updatedAt = data.updatedAt
      }
      if (!isNaN(data.createdAt)) {
        this.createdAt = data.createdAt
      }
    }
  }

  validate(validator: boolean, required: boolean, updatable: boolean): string[] {
    const metadataKeys = Reflect.getMetadataKeys(this)
    const issues: string[] = []
    metadataKeys.forEach(key => {
      const [_, propertyName, type] = key.split(':')
      const value = (this as any)[propertyName]
      if (validator && type === 'validator') {
        const validatorFunction = Reflect.getMetadata(key, this)
        if (validatorFunction) {
          const result = validatorFunction(value)
          if (!result) {
            issues.push(`${propertyName} is invalid`)
          }
        }
      }
      if (required && type === 'required') {
        const required = Reflect.getMetadata(key, this)
        if (required && !value) {
          issues.push(`${propertyName} is required`)
        }
      }
      if (updatable && type === 'updatable') {
        const updatable = Reflect.getMetadata(key, this)
        if (!updatable && value) {
          issues.push(`${propertyName} is not updatable`)
        }
      }
    })
    return issues
  }
}