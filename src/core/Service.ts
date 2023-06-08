import { FindOneOptions, FindOptionsWhere } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { IResult, Result, ResultWithCount, WithCount } from "./result";
import { BaseEntity } from "./BaseEntity";
import { Dao, _QueryDeepPartialEntity } from "./Dao";

export interface IService<Entity extends BaseEntity> {
  /**
   * Get all entities 
   * @param id ID of the entity to find
   */
  readOne(id: number | string): Promise<IResult<Entity>>;
  /**
   * Read Many 
   * @param page Page number to get
   * @param count Count of items to get
   * @param order Order to get items in
   * @param field Order field
   * @param where where clause
   */
  readMany(page?: number, count?: number, order?: 'ASC' | 'DESC', field?: keyof Entity, where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]): Promise<IResult<Entity[] | null>>;
  /**
   * Read Many without pagination
   * @param order Order to get items in
   * @param field Order field
   * @param where where clause
   */
  readManyWithoutPagination(order: 'ASC' | 'DESC', field: keyof Entity, where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]): Promise<IResult<Entity[] | null>>;
  /**
   * Create an entity in database
   * @param value Value to create
   */
  create(value: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[],): Promise<IResult<string | number | null>>;
  /**
   * Update an entity in database 
   * @param id id, where clause of the entity to update
   * @param values values to update 
   */
  update(id: string | number | FindOptionsWhere<Entity>, values: QueryDeepPartialEntity<Entity>): Promise<Result<number | null>>;
  /**
   * Delete an entity in database 
   * @param id id, where clause of the entity to delete
   */
  delete(id: string | number | string[] | FindOptionsWhere<Entity>): Promise<Result<number | null>>;
}

export abstract class Service<Entity extends BaseEntity> implements IService<Entity> {
  dao: Dao<Entity>;
  constructor(dao: Dao<Entity>) {
    this.dao = dao
  }
  async readOne(filter: string | number | FindOneOptions<Entity>): Promise<Result<Entity | null>> {
    const result = await this.dao.read(filter)
    return new Result(result.status.error, result.status.code, result.message, result.result);
  }
  async readMany(
    page = 1, count = 10, order: 'ASC' | 'DESC' = 'DESC',
    field?: keyof Entity, where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    fromCreatedDate?: Date, toCreatedDate?: Date,
    like?: { [key: string]: string }
  )
    : Promise<WithCount<Result<Entity[]>>> {
    const result = await this.dao.readMany(page, count, order, field, where, fromCreatedDate, toCreatedDate, like)
    return new ResultWithCount(result.status.error, result.status.code, result.message, result.result, result.count ?? null);
  }
  async readManyWithoutPagination(
    order: 'ASC' | 'DESC' = 'DESC',
    field?: keyof Entity, where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    fromCreatedDate?: Date, toCreatedDate?: Date,
    like?: { [key: string]: string }
  ):
    Promise<Result<Entity[] | null>> {
    const result = await this.dao.readManyWithoutPagination(order, field, where, fromCreatedDate, toCreatedDate, like)
    return new Result(result.status.error, result.status.code, result.message, result.result);
  }
  async create(value: _QueryDeepPartialEntity<Entity> | _QueryDeepPartialEntity<Entity>[],): Promise<Result<number | string | null>> {
    const result = await this.dao.create(value)
    return new Result(result.status.error, result.status.code, result.message, result.result);
  }

  async update(id: string | number | FindOptionsWhere<Entity>, values: QueryDeepPartialEntity<Entity>): Promise<Result<number | null>> {
    let filter: string | number | FindOneOptions<Entity>
    if (typeof id === 'string' || typeof id === 'number') {
      filter = id
    } else {
      filter = { where: id }
    }
    const read = await this.readOne(filter)
    if (read.status.error) {
      return new Result(true, read.status.code, read.message, 0)
    }
    const result = await this.dao.update(id, values)
    return new Result(result.status.error, result.status.code, result.message, result.result);
  }
  async delete(id: string | number | string[] | FindOptionsWhere<Entity>): Promise<Result<number | null>> {
    const result = await this.dao.delete(id)
    return new Result(result.status.error, result.status.code, result.message, result.result);
  }
}