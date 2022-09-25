import { ContextProvider } from '@smoke-trees/smoke-context';
import compression from 'compression';
import express from 'express';
import { Application } from "../core/app";
import Database from "../core/database";
import { GetApiDocumentation, OpenApi } from '../core/documentation/open-api';
import { paths } from '../core/documentation/path';
import morgan from '../core/morgan';
import { Settings } from "../core/settings";
import { User, UserController, UserDao, UserService } from "../Example/users";

const settings = new Settings()

const database = new Database(settings)
database.addEntity(User)


const app = new Application(settings, database)


app.addMiddleWare(morgan)
app.addMiddleWare(ContextProvider.getMiddleware({ headerName: 'X-Request-ID' }))
app.addMiddleWare(compression())
app.addMiddleWare(express.json({}))

const userDao = new UserDao(database)
const userService = new UserService(userDao)
const userController = new UserController(app, userService);

app.addController(userController)

app.loadMiddleware()
app.loadControllers()

OpenApi({
  servers: [{ url: 'http://localhost:3000', description: 'Local server' }],
  openapi: '3.0.1',
  basePath: '/api',
  info: {
    description: 'Test',
    title: 'Test',
    version: '1.0.1'
  },
  tags: [{ name: 'User', description: 'User operations' }],
})(app)



console.log(GetApiDocumentation(app))

app.run()

