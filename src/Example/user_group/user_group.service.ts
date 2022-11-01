import { Service } from "../../core/Service";
import { UserGroupDao } from "./user_group.dao";
import { UserGroup } from "./user_group.entity";

export class UserGroupService extends Service<UserGroup> {
  dao: UserGroupDao;
  constructor(userDao: UserGroupDao) {
    super(userDao)
    this.dao = userDao
  }
}