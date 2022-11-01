import { Dao } from "../../core/Dao";
import Database from "../../core/database";
import { Policy } from "./policy.entity";

export class PolicyDao extends Dao<Policy> {
  constructor(database: Database) {
    super(database, Policy, "policy");
  }
}