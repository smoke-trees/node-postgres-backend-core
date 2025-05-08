/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export interface BaseEntityConstructor<T> {
  new (data?: any): T;
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

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  constructor(data?: any) {
    if (data) {
      if (data.id) {
        this.id = data.id;
      }
      if (data.updatedAt && !isNaN(data.updatedAt)) {
        this.updatedAt = data.updatedAt;
      }
      if (data.createdAt && !isNaN(data.createdAt)) {
        this.createdAt = data.createdAt;
      }
    }
  }
}
