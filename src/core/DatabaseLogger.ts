/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Logger, QueryRunner } from "typeorm";
import log from "./log";

export class DatabaseLogger implements Logger {
  logQuery(
    query: string,
    parameters?: any[] | undefined,
    queryRunner?: QueryRunner | undefined
  ) {
    log.debug(query, "database/query", { parameters });
  }
  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[] | undefined,
    queryRunner?: QueryRunner | undefined
  ) {
    log.error(
      error instanceof Error ? error.message : "Something went wrong",
      "database/queryError",
      error,
      { query, parameters }
    );
  }
  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[] | undefined,
    queryRunner?: QueryRunner | undefined
  ) {
    log.warn(query, "database/schemaBuild", { time, query });
  }
  logSchemaBuild(message: string, queryRunner?: QueryRunner | undefined) {
    log.debug(message, "database/schemaBuild", {});
  }
  logMigration(message: string, queryRunner?: QueryRunner | undefined) {
    log.info(message, "database/migration", {});
  }
  log(
    level: "warn" | "info" | "log",
    message: any,
    queryRunner?: QueryRunner | undefined
  ) {
    log.debug(message, "database/general", { level });
  }
}
