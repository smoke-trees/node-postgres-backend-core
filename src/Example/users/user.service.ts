import { FindOptionsWhere, FindManyOptions } from "typeorm";
import { Service } from "../../core/Service";
import { WithCount, Result, ResultWithCount } from "../../core/result";
import { UserDao } from "./user.dao";
import { User } from "./user.entity";

export class UserService extends Service<User> {
  dao: UserDao;
  constructor(userDao: UserDao) {
    super(userDao)
    this.dao = userDao
  }


  async readMany(
    page = 1, count = 10, order: 'ASC' | 'DESC' = 'DESC',
    field?: keyof User, where?: FindOptionsWhere<User> | FindOptionsWhere<User>[],
    fromCreatedDate?: Date, toCreatedDate?: Date,
    like?: {
      [key: string]: string,
    },
    options?: FindManyOptions<User>
  )
    : Promise<WithCount<Result<User[]>>> {
    const result = await this.dao.readMany(
      page, count, order, field, where, fromCreatedDate, toCreatedDate, like,
      options, undefined, 'or'
    )
    return new ResultWithCount(result.status.error, result.status.code, result.message, result.result, result.count ?? null);
  }
}