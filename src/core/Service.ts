import { FindOneOptions, FindOptionsWhere } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { IResult, Result, ResultWithCount, WithCount } from "./result";
import { BaseEntity } from "./BaseEntity";
import { Dao } from "./Dao";

export interface IService<Entity extends BaseEntity> {
  readOne(id: number | string): Promise<IResult<Entity>>;
  readMany(page?: number, count?: number, order?: 'ASC' | 'DESC', field?: keyof Entity, where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]): Promise<IResult<Entity[] | null>>;
  readManyWithoutPagination(order: 'ASC' | 'DESC', field: keyof Entity, where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]): Promise<IResult<Entity[] | null>>;
  create(value: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[],): Promise<IResult<string | number | null>>;
  update(id: string | number | FindOptionsWhere<Entity>, values: QueryDeepPartialEntity<Entity>): Promise<Result<number | null>>;
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
  async readMany(page = 1, count = 10, order: 'ASC' | 'DESC' = 'DESC', field?: keyof Entity, where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[])
    : Promise<WithCount<Result<Entity[]>>> {
    const result = await this.dao.readMany(page, count, order, field, where)
    return new ResultWithCount(result.status.error, result.status.code, result.message, result.result, count);
  }
  async readManyWithoutPagination(order: 'ASC' | 'DESC' = 'DESC', field?: keyof Entity, where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]):
    Promise<Result<Entity[] | null>> {
    const result = await this.dao.readManyWithoutPagination(order, field, where)
    return new Result(result.status.error, result.status.code, result.message, result.result);
  }
  async create(value: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[],): Promise<Result<number | string | null>> {
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