/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import {
  DataSource,
  DataSourceOptions,
  EntitySchema,
  MixedList,
} from "typeorm";
import { DatabaseLogger } from "./DatabaseLogger";
import log from "./log";
import { Settings } from "./settings";
import { StLogger } from "./StLogger/StLogger.entity";
export class Database {
  private _connection!: DataSource;
  public get connection(): DataSource {
    return this._connection;
  }
  private _ready: Promise<boolean>;
  private entities: MixedList<Function | string | EntitySchema> = [StLogger];
  private migrations: MixedList<Function | string> = [];
  private settings: Settings;
  get ready(): Promise<boolean> {
    return this._ready;
  }

  /**
   * Creates a Database Object
   * @param settings Settings Object to be used by the application
   * @param connect Whether to connect to the database or not
   */
  constructor(settings: Settings, connect = false) {
    this.settings = settings;
    if (connect) {
      this._ready = this.connect();
    } else {
      this._ready = Promise.resolve(false);
    }
  }

  /**
   * Add Entity to the Database config
   * @param entity Entities to be added
   */
  addEntity(...entity: (Function | string | EntitySchema)[]) {
    if (this.entities instanceof Array) {
      this.entities.push(...entity);
    }
  }
  /**
   * Add Migration to the Database config
   * @param entity Migrations to be added
   */
  addMigration(...entity: (Function | string)[]) {
    if (this.migrations instanceof Array) {
      this.migrations.push(...entity);
    }
  }

  async connect(): Promise<boolean> {
    this._connection = new DataSource(this.getConfig());
    try {
      await this.connection.initialize();
      log.info("Database connected", "database/connect");
      return true;
    } catch (error) {
      log.error("Database connection error", "database/connect", error, {
        config: this.getConfig(),
      });
      return false;
    }
  }

  /**
   * Returns the database connection
   * @returns Returns the connection name
   */
  getConnection(): DataSource {
    return this.connection;
  }

  /**
   * Returns the database connection name
   * @returns Returns the database config
   */
  getConfig(): DataSourceOptions {
    const config: DataSourceOptions = {
      type: this.settings.databaseType as any,
      port: parseInt(this.settings.dbPort ?? ""),
      name: this.settings.connectionName,
      database: this.settings.database,
      host: this.settings.dbHost,
      username: this.settings.dbUser,
      password: this.settings.dbPassword,
      entities: this.entities,
      migrations: this.migrations,
      synchronize: this.settings.syncDatabase,
      migrationsRun: this.settings.runMigrations,
      logging: ["error", "migration"],
      logger: new DatabaseLogger(),
      ...this.settings.databaseSettings,
    };
    return config;
  }
}

export default Database;
