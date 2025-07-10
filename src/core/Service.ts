import {
  EntityManager,
  FindOneOptions,
  FindOptionsSelect,
  FindOptionsWhere,
} from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { BaseEntity } from "./BaseEntity";
import { Dao, QueryOption, SelectedRead, _QueryDeepPartialEntity } from "./Dao";
import { IResult, Result, ResultWithCount, WithCount } from "./result";

export interface IService<Entity extends BaseEntity> {
  /**
   * Get all entities
   * @param id ID of the entity to find
   */
  readOne(
    id: number | string,
    manager?: EntityManager
  ): Promise<IResult<SelectedRead<Entity>>>;
  /**
   * Read Many
   * @param page Page number to get
   * @param count Count of items to get
   * @param order Order to get items in
   * @param field Order field
   * @param where where clause
   */
  readMany<S extends FindOptionsSelect<Entity> | undefined = undefined>(
    options?: QueryOption<Entity, S>,
    manager?: EntityManager
  ): Promise<IResult<SelectedRead<Entity, S>[] | null>>;
  /**
   * Create an entity in database
   * @param value Value to create
   */
  create(
    value: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[],
    manager?: EntityManager
  ): Promise<IResult<string | number | null>>;
  /**
   * Update an entity in database
   * @param id id, where clause of the entity to update
   * @param values values to update
   */
  update(
    id: string | number | FindOptionsWhere<Entity>,
    values: QueryDeepPartialEntity<Entity>,
    manager?: EntityManager
  ): Promise<Result<number | null>>;

  /**
   * Delete an entity in database
   * @param id id, where clause of the entity to delete
   */
  delete(
    id: string | number | string[] | FindOptionsWhere<Entity>,
    manager?: EntityManager
  ): Promise<Result<number | null>>;
}

export abstract class Service<Entity extends BaseEntity>
  implements IService<Entity>
{
  dao: Dao<Entity>;

  constructor(dao: Dao<Entity>) {
    this.dao = dao;
  }

  async readOne<S extends FindOptionsSelect<Entity> | undefined = undefined>(
    filter:
      | string
      | number
      | (Omit<FindOneOptions<Entity>, "select"> & { select?: S }),
    manager?: EntityManager
  ): Promise<Result<SelectedRead<Entity, S> | null>> {
    const result = await this.dao.read(filter, manager);
    return new Result(
      result.status.error,
      result.status.code,
      result.message,
      result.result
    );
  }

  async readMany<S extends FindOptionsSelect<Entity> | undefined = undefined>(
    options?: QueryOption<Entity, S>,
    manager?: EntityManager
  ): Promise<WithCount<Result<SelectedRead<Entity, S>[]>>> {
    const result = await this.dao.readMany(options, manager);
    return new ResultWithCount(
      result.status.error,
      result.status.code,
      result.message,
      result.result,
      result.count ?? null
    );
  }

  async create(
    value: _QueryDeepPartialEntity<Entity> | _QueryDeepPartialEntity<Entity>[],
    manager?: EntityManager
  ): Promise<Result<number | string | null>> {
    const result = await this.dao.create(value, manager);
    return new Result(
      result.status.error,
      result.status.code,
      result.message,
      result.result
    );
  }

  async update(
    id: string | number | FindOptionsWhere<Entity>,
    values: QueryDeepPartialEntity<Entity>,
    manager?: EntityManager
  ): Promise<Result<number | null>> {
    let filter: string | number | Omit<FindOneOptions<Entity>, "select">;
    if (typeof id === "string" || typeof id === "number") {
      filter = id;
    } else {
      filter = { where: id };
    }
    const read = await this.readOne(filter);
    if (read.status.error) {
      return new Result(true, read.status.code, read.message, 0);
    }
    const result = await this.dao.update(id, values, manager);
    return new Result(
      result.status.error,
      result.status.code,
      result.message,
      result.result
    );
  }

  async delete(
    id: string | number | string[] | FindOptionsWhere<Entity>,
    manager?: EntityManager
  ): Promise<Result<number | null>> {
    const result = await this.dao.delete(id, manager);
    return new Result(
      result.status.error,
      result.status.code,
      result.message,
      result.result
    );
  }
}
