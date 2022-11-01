import { Dao } from "../../core/Dao";
import Database from "../../core/database";
import { GroupPolicy } from "./group_policy.entity";

export class GroupPolicyDao extends Dao<GroupPolicy> {
  constructor(database: Database) {
    super(database, GroupPolicy, "group_policy");
  }
}