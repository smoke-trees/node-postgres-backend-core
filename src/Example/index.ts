import { ContextProvider } from "@smoke-trees/smoke-context";
import compression from "compression";
import express from "express";
import { User, UserController, UserDao, UserService } from "../Example/users";
import { enableLoggerCircuitBreaker } from "../core/StLogger/StLogger.middleware";
import { Application } from "../core/app";
import Database from "../core/database";
import { Documentation } from "../core/documentation/SmokeDocs";
import { Settings } from "../core/settings";
class DataSettings extends Settings {
  databaseType: "postgres" | "mysql";
  dbPassword: string;
  dbUser: string;
  dbHost: string;
  dbPort: string | undefined;
  database: string;

  constructor() {
    super();
    this.databaseType = "postgres";
    this.dbPassword = "mysecretpassword";
    this.dbUser = "postgres";
    this.dbHost = "localhost";
    this.database = "postgres";
  }
}

const settings = new DataSettings();
const database = new Database(settings);
database.addEntity(User);

database.connect();

const app = new Application(settings, database);

app.addMiddleWare(
  ContextProvider.getMiddleware({ headerName: "X-Request-ID" })
);
app.addMiddleWare(compression());
app.addMiddleWare(express.json({}));

const userDao = new UserDao(database);
const userService = new UserService(userDao);
const userController = new UserController(app, userService);

app.addController(userController);

Documentation.addServers([
  {
    url: "http://localhost:8080",
    description: "Local server",
  },
]);

Documentation.addTags([
  {
    name: "User",
    description: "User related endpoints",
  },
]);

Documentation.addInfo({
  title: "Postgres Backend Template",
  description: "This is a template for a postgres backend",
  version: "1.0.0",
});

console.log(JSON.stringify(Documentation.getAPIJson(), null, 2));

enableLoggerCircuitBreaker(settings);

app.loadMiddleware();
app.loadControllers();
app.run();
