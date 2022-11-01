import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export interface ISettings {
  port: string;
  connectionName: String;
  getValue(key: string, defaultValue?: string): string | undefined;
}

export class Settings implements ISettings {
  port: string
  connectionName: string;
  pgHost: string;
  pgPassword: string;
  pgDatabase: string;
  pgPort: string;
  pgUser: string;
  interceptors: boolean;
  syncDatabase: boolean;
  isAuthorizationDisabled: boolean;
  runMigrations: boolean;
  production: boolean;
  databaseSettings: Partial<Omit<PostgresConnectionOptions, 'username' | 'password' | 'port' | 'type' | 'host' | 'database' | 'entities' | 'migrations' | 'synchronize' | 'migrationsRun' | 'name'>>;
  constructor() {
    this.production = this.getValue('NODE_ENV') === 'production'
    this.port = this.getValue('PORT', '8080')
    this.interceptors = true
    this.connectionName = 'default'
    this.pgHost = this.getValue('PGHOST', 'localhost')
    this.pgPassword = this.getValue('PGPASSWORD', 'mysecretpassword')
    this.pgDatabase = this.getValue('PGDATABASE', 'postgres')
    this.pgPort = this.getValue('PGPORT', '80')
    this.pgUser = this.getValue('PGUSER', 'postgres')
    this.syncDatabase = this.production ? false : true
    this.runMigrations = this.production ? true : false
    this.databaseSettings = {}
    this.isAuthorizationDisabled = false
  }

  getValue(key: string, defaultValue: string): string;
  getValue(key: string): string | undefined;
  getValue(key: string, defaultValue?: string): string | undefined {
    return (process.env[key] ?? defaultValue)
  }
}