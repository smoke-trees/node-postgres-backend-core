import { ContextProvider } from '@smoke-trees/smoke-context';
import compression from 'compression';
import express from 'express';
import { Application } from "../core/app";
import Database from "../core/database";
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

app.run()
