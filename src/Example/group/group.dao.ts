import { Dao } from "../../core/Dao";
import Database from "../../core/database";
import { Group } from "./group.entity";

export class GroupDao extends Dao<Group> {
  constructor(database: Database) {
    super(database, Group, "group");
  }
}