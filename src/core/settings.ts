import { config } from "dotenv";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export interface ISettings {
  port: string;
  connectionName: string;
  getValue(key: string, defaultValue?: string): string | undefined;
}

export abstract class Settings implements ISettings {
  abstract databaseType: "postgres" | "mysql";
  abstract dbPassword: string;
  abstract dbUser: string;
  abstract dbHost: string;
  abstract dbPort: string | undefined;
  abstract database: string;

  port: string;
  connectionName: string;
  interceptors: boolean;
  syncDatabase: boolean;
  runMigrations: boolean;
  production: boolean;
  loggerEnable: boolean;
  loggerCircuitBreakerCount: number;
  loggerCircuitBreakerTime: number;
  loggerCircuitBrokenTime: number;
  databaseSettings: Partial<
    Omit<
      PostgresConnectionOptions,
      | "username"
      | "password"
      | "port"
      | "type"
      | "host"
      | "database"
      | "entities"
      | "migrations"
      | "synchronize"
      | "migrationsRun"
      | "name"
    >
  >;

  constructor() {
    config();
    this.production = this.getValue("NODE_ENV") === "production";
    this.port = this.getValue("PORT", "8080");
    this.loggerEnable =
      this.getValue("LOGGER_ENABLE", "true").toLowerCase() === "true";
    this.loggerCircuitBreakerCount = 100;
    this.loggerCircuitBreakerTime = 10 * 1000;
    this.loggerCircuitBrokenTime = 60 * 60 * 1000; // minutes * seconds * milliseconds
    this.interceptors = true;
    this.connectionName = "default";
    this.syncDatabase = this.production ? false : true;
    this.runMigrations = this.production ? true : false;
    this.databaseSettings = {};
  }

  getValue(key: string, defaultValue: string): string;
  getValue(key: string): string | undefined;
  getValue(key: string, defaultValue?: string): string | undefined {
    return process.env[key] ?? defaultValue;
  }
}
