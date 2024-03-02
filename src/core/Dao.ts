import { Between, EntityManager, EntityTarget, FindManyOptions, FindOneOptions, FindOptionsWhere, ILike, In, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { BaseEntity } from "./BaseEntity";
import Database from "./database";
import log from "./log";
import { ErrorCode, Result, ResultWithCount, WithCount } from "./result";

export type _QueryDeepPartialEntity<T> = {
  [P in keyof T]?: (T[P] extends Array<infer U> ? Array<_QueryDeepPartialEntity<U>> : T[P] extends ReadonlyArray<infer U> ? ReadonlyArray<_QueryDeepPartialEntity<U>> : _QueryDeepPartialEntity<T[P]>) | (() => string);
};

export interface QueryOption<E> {
  page?: number;
  count?: number;
  order?: 'ASC' | 'DESC';
  field?: keyof BaseEntity;
  where?: FindOptionsWhere<E> | FindOptionsWhere<E>[];
  like?: { [key: string]: string };
  fromCreatedDate?: Date;
  toCreatedDate?: Date;
  nonPaginated?: boolean;
  options?: FindManyOptions<E>;
}


export class Dao<Entity extends BaseEntity> {
  protected database: Database;
  protected entity: EntityTarget<Entity>;
  protected entityName: string;
  /**
   * Get a Dao instance
   * @param database Database Instance
   * @param entity Entity Constructor
   * @param name Name of the entity
   * @returns Dao Instance
   */
  static getDao<T extends BaseEntity>(database: Database, entity: EntityTarget<T>, name: string) {
    return new this(database, entity, name)
  }
  constructor(database: Database, entity: EntityTarget<Entity>, name: string) {
    this.database = database
    this.entity = entity
    this.entityName = name
  }
  /**
   * Create a new entity
   * @param value Value to be inserted
   * @param manager EntityManager to be used for the operation (optional). Use only for transactions
   * @returns
   */
  async create(value: _QueryDeepPartialEntity<Entity> | _QueryDeepPartialEntity<Entity>[], manager?: EntityManager): Promise<Result<number | string>> {
    if (!manager) {
      manager = (this.database.getConnection()).createEntityManager()
    }
    const repository = manager.getRepository(this.entity);
    try {
      const result = await repository.insert(value);
      if (!(value instanceof Array)) {
        value.id = result.identifiers[0].id ?? (result.identifiers[0] as [key: string])[0];
      }
      log.info("Successfully created", `${this.entityName}/create`, {});
      return new Result(false, ErrorCode.Created, "Success in insert", result.identifiers[0].id)
    } catch (error) {
      log.error(`Error in inserting ${this.entityName}`, `${this.entityName}/insert`, error);
      return new Result(true, ErrorCode.DatabaseError, 'Error in insert')
    }
  }

  /**
   * Read a single entity
   * @param value Id of the entity to be read
   * @param manager EntityManager to be used for the operation (optional). Use only for transactions
   * @returns Result with the entity
   */
  async read(value: string | number | FindOneOptions<Entity>, manager?: EntityManager): Promise<Result<Entity>> {
    if (!manager) {
      manager = (this.database.getConnection()).createEntityManager()
    }
    const repository = manager.getRepository(this.entity);
    try {
      let options: FindOneOptions;
      if (typeof value === "number" || typeof value === "string") {
        options = { where: { id: value } }
      } else {
        options = value
      }
      const result = await repository.findOne(options);
      if (!result) {
        log.debug("Find not found", `${this.entityName}/read`, { id: value });
        return new Result(true, ErrorCode.NotFound, 'Not found')
      }
      log.debug("Successfully found", `${this.entityName}/read`, { id: value });
      return new Result(false, ErrorCode.Success, "Success in read", result)
    } catch (error) {
      log.error("Error in reading", `${this.update}/read`, error, { id: value });
      return new Result(true, ErrorCode.DatabaseError, "Error in reading")
    }
  }

  /**
   * Update a single entity
   * @param id Id or the find where options of the entity to be updated
   * @param values Values to be updated
   * @param manager EntityManager to be used for the operation (optional). Use only for transactions
   * @returns Result with the number of rows updated
   */
  async update(id: string | number | FindOptionsWhere<Entity>, values: QueryDeepPartialEntity<Entity>, manager?: EntityManager): Promise<Result<number | null>> {
    if (!manager) {
      manager = (this.database.getConnection()).createEntityManager()
    }
    const repository = manager.getRepository(this.entity);
    let copy = { ...values };
    try {
      const result = await repository.update(id, copy);
      if (result.affected === 0) {
        log.debug("Update not found", `${this.entityName}/update`, { id, });
        return new Result(true, ErrorCode.NotFound, "Not found")
      }
      log.debug("Successfully updated", `${this.entityName}/update`, { id, });
      return new Result(false, ErrorCode.Success, 'Success in update', result.affected ?? null)

    } catch (error) {
      log.error("Error in updating", `${this.entityName}/update`, error, { id, copy });
      return new Result(true, ErrorCode.DatabaseError, "Error in updating", null)
    }
  }

  parseFilter(where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]): FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[] {
    if (where instanceof Array) {
      where = where.map((it) => this.parseFilter(it)) as FindOptionsWhere<Entity>[]
      return where
    }
    Object.keys(where).forEach(key => {
      if ((where as any)[key] instanceof Array) {
        (where as any)[key] = In((where as any)[key])
      }
      if ((where as any)[key] === 'true') {
        (where as any)[key] = true
      }
      if ((where as any)[key] === 'false') {
        (where as any)[key] = false
      }
    })
    return where
  }

  /**
   * Parses sort values. Sort object to work across relations need to have
   * syntax: { entity: {field: ASC }}
   *
   */
  parseForSort(field: keyof Entity, order: 'ASC' | 'DESC') {
    const result: any = {};
    let level = result;
    const sortLevels = field.toString().split('.') || [];

    for (let i = sortLevels.length - 1; i >= 0; i--) {
      console.log(level)
      const prop = sortLevels[i];
      if (i === sortLevels.length - 1) {
        level[prop] = order || 'ASC';
      }
      else {
        let newLevel = { [prop]: level }
        level = newLevel
      }
    }
    return level
  }

  parseForLike(like?: { [key: string]: string }) {
    let likeParsed;
    if (like) {
      likeParsed = Object.keys(like).reduce((acc, it) => { acc[it] = ILike((like as any)[it]); return acc; }, {} as any)
    } else {
      likeParsed = {}
    }
    return likeParsed
  }

  parseForDates(
    field: keyof Entity,
    from?: Date | string,
    to?: Date | string,
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]
  ) {
    if (from && to && !(where instanceof Array)) {
      if (!where) {
        where = {}
      }
      where = { ...where, [field]: Between(from, to) }
    } else if (from && !(where instanceof Array)) {
      if (!where) {
        where = {}
      }
      where = { ...where, createdAt: MoreThanOrEqual(from) }
    }
    else if (to && !(where instanceof Array)) {
      if (!where) {
        where = {}
      }
      where = { ...where, createdAt: LessThanOrEqual(to) }
    }
    return where
  }

  parseWhere(
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    like?: { [key: string]: string },
    fromCreatedDate?: Date,
    toCreatedDate?: Date,
  ) {
    if (where) {
      where = this.parseFilter(where)
    }

    const likeParsed = this.parseForLike(like)


    where = this.parseForDates(
      'createdAt',
      fromCreatedDate,
      toCreatedDate,
      where
    )

    where = { ...where, ...likeParsed }

    return where
  }

  /**
   * Read a paginated list of entities
   * @param page Page number
   * @param count Number of entries in a page
   * @param order Order in which the entries should be returned
   * @param field Order field
   * @param where Where condition
   * @param manager EntityManager to be used for the operation (optional). Use only for transactions
   * @returns Result with the list of entities
   */
  async readMany(
    options: {
      page: number,
      count: number,
      order: 'ASC' | 'DESC',
      field: keyof Entity,
      where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
      fromCreatedDate?: Date, toCreatedDate?: Date,
      like?: { [key: string]: string },
      dbOptions?: FindManyOptions<Entity>,
    },
    manager?: EntityManager,
  ): Promise<WithCount<Result<Entity[]>>> {
    let {
      page = 1,
      count = 10,
      order = 'DESC',
      field = 'creadtedAt' as keyof Entity,
      where,
      fromCreatedDate,
      toCreatedDate,
      like,
      dbOptions
    } = options
    if (!manager) {
      manager = (this.database.getConnection()).createEntityManager()
    }
    const repository = manager.getRepository(this.entity);

    try {

      const parsedWhere = this.parseWhere(
        where,
        like,
        fromCreatedDate,
        toCreatedDate,
      )
      const orderValue: any = this.parseForSort(field, order)

      log.debug("Read many values", 'readMany', { orderValue, where })

      const result = await repository.find({
        where: parsedWhere,
        skip: (page - 1) * count,
        take: count,
        order: orderValue,
        ...dbOptions
      });

      log.debug("Successfully found", `${this.entityName}/readMany`, { page, count, orderValue, field });
      const totalCount = await repository.count({ where });
      return new ResultWithCount(false, ErrorCode.Success, 'Success in readMany', result, totalCount)
    } catch (error) {
      log.error("Error in reading", `${this.entityName}/readMany`, error, { page, count, order, field });
      return new ResultWithCount(true, ErrorCode.DatabaseError, "Error in reading", null, null)
    }
  }

  /**
   * Read a paginated list of entities
   * @param order Order in which the entries should be returned
   * @param field Order field
   * @param where Where condition
   * @param manager EntityManager to be used for the operation (optional). Use only for transactions
   * @returns
   */
  async readManyWithoutPagination(
    options: {
      order: 'ASC' | 'DESC',
      field: keyof Entity,
      where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
      fromCreatedDate?: Date, toCreatedDate?: Date,
      like?: { [key: string]: string },
      dbOptions?: FindManyOptions<Entity>,
    },
    manager?: EntityManager
  ): Promise<Result<Entity[]>> {
    let {
      order = 'DESC',
      field = 'createdAt' as keyof Entity,
      where,
      fromCreatedDate,
      toCreatedDate,
      like,
      dbOptions
    } = options
    if (!manager) {
      manager = (this.database.getConnection()).createEntityManager()
    }
    const repository = manager.getRepository(this.entity);

    try {


      const parsedWhere = this.parseWhere(
        where,
        like,
        fromCreatedDate,
        toCreatedDate
      )
      const orderValue: any = this.parseForSort(field, order)

      log.debug("Read many values", 'readManyWithoutPagination', { orderValue, where })

      const result = await repository.find({
        order: orderValue,
        where: parsedWhere,
        ...dbOptions
      });
      if (result.length === 0) {
        log.debug("Find not found", `${this.entityName}/readManyWithoutPagination`, { order, field, where });
        return new Result(true, ErrorCode.NotFound, "Not found")
      }
      log.debug("Successfully found", `${this.entityName}/readManyWithoutPagination`, { order, field });
      return new Result(false, ErrorCode.Success, 'Success in read many', result)
    } catch (error) {
      log.error("Error in reading", `${this.entityName}/readManyWithoutPagination`, error, { order, field });
      return new Result(true, ErrorCode.DatabaseError, "Error in reading")
    }
  }

  /**
   * Delete entities
   * @param id Id , ids or Conditions of the entity to be deleted
   * @param manager EntityManager to be used for the operation (optional). Use only for transactions
   * @returns
   */
  async delete(id: string | number | string[] | FindOptionsWhere<Entity>, manager?: EntityManager): Promise<Result<number>> {
    if (!manager) {
      manager = (this.database.getConnection()).createEntityManager()
    }
    const repository = manager.getRepository(this.entity);
    try {
      const result = await repository.delete(id);

      if (result.affected === 0) {
        log.debug("Delete not found", `${this.entityName}/delete`, { id });
        return new Result(true, ErrorCode.NotFound, 'Not found', result.affected)
      }
      log.debug("Successfully deleted", `${this.entityName}/delete`, { id });
      return new Result(false, ErrorCode.Success, 'Success in delete', result.affected ?? 0)
    } catch (error) {
      log.error("Error in deleting", `${this.entityName}/delete`, error, { id });
      return new Result(true, ErrorCode.DatabaseError, 'Error in deleting')
    }
  }
}
