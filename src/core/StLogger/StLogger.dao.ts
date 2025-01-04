import { Dao } from "../Dao";
import Database from "../database";
import { StLogger } from "./StLogger.entity";

export class StLoggerDao extends Dao<StLogger> {
  constructor(db: Database) {
    super(db, StLogger, "st_logger");
  }
}
