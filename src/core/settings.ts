import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export interface ISettings {
  port: string;
  connectionName: String;
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
    this.production = this.getValue("NODE_ENV") === "production";
    this.port = this.getValue("PORT", "8080");
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
