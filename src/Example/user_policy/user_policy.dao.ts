import { Dao } from "../../core/Dao";
import Database from "../../core/database";
import { UserPolicy } from "./user_policy.entity";

export class PolicyDao extends Dao<UserPolicy> {
  constructor(database: Database) {
    super(database, UserPolicy, "user_policy");
  }
}