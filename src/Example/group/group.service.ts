import { Service } from "../../core/Service";
import { GroupDao } from "./group.dao";
import { Group } from "./group.entity";

export class GroupService extends Service<Group> {
  dao: GroupDao;
  constructor(userDao: GroupDao) {
    super(userDao)
    this.dao = userDao
  }
}