import { ContextProvider } from '@smoke-trees/smoke-context';
import compression from 'compression';
import express from 'express';
import { Application } from "../core/app";
import Database from "../core/database";
import { Documentation } from '../core/documentation/SmokeDocs';
import morgan from '../core/morgan';
import { Settings } from "../core/settings";
import { User, UserController, UserDao, UserService } from "../Example/users";
import { Group } from './group';
import { GroupPolicy } from './group_policy';
import { Policy } from './policy';
import { UserGroup } from './user_group';
import { UserPolicy } from './user_policy';
import { WalletDao, WalletService, WalletController, Wallet } from './wallet';

const settings = new Settings()

const database = new Database(settings)
database.addEntity(User)
database.addEntity(Wallet)
database.addEntity(Policy)
database.addEntity(Group)
database.addEntity(UserPolicy)
database.addEntity(UserGroup)
database.addEntity(GroupPolicy)


const app = new Application(settings, database)


app.addMiddleWare(morgan)
app.addMiddleWare(ContextProvider.getMiddleware({ headerName: 'X-Request-ID' }))
app.addMiddleWare(compression())
app.addMiddleWare(express.json({}))

const userDao = new UserDao(database)
const userService = new UserService(userDao)
const userController = new UserController(app, userService);

const walletDao = new WalletDao(database)
const walletService = new WalletService(walletDao)
const walletController = new WalletController(app, walletService);

app.addController(userController)
app.addController(walletController)



Documentation.addServers([{
  url: 'http://localhost:8080',
  description: 'Local server'
}])

Documentation.addTags([{
  name: 'User',
  description: 'User related endpoints'
}])

Documentation.addInfo({
  title: 'Postgres Backend Template',
  description: 'This is a template for a postgres backend',
  version: '1.0.0'
})

console.log(JSON.stringify(Documentation.getAPIJson(), null, 2))

app.loadMiddleware()
app.loadControllers()
app.run()

