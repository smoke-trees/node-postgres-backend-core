import { Dao } from "../../core/Dao";
import Database from "../../core/database";
import { UserGroup } from "./user_group.entity";

export class UserGroupDao extends Dao<UserGroup> {
  constructor(database: Database) {
    super(database, UserGroup, "user_group");
  }
}