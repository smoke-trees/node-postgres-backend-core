import { ContextProvider } from '@smoke-trees/smoke-context';
import compression from 'compression';
import express from 'express';
import { Application } from "../core/app";
import Database from "../core/database";
import morgan from '../core/morgan';
import { Settings } from "../core/settings";
import { Group } from '../Example/group';
import { GroupPolicy } from '../Example/group_policy';
import { Policy } from '../Example/policy';
import { User, UserController, UserDao, UserService } from "../Example/users";
import { UserGroup } from '../Example/user_group';
import { UserPolicy } from '../Example/user_policy';
import { Wallet, WalletController, WalletDao, WalletService } from '../Example/wallet';
import { ExampleControllerTest } from "./app/User/controller.test";
import { ExampleServiceTest } from './app/User/services.test';
import { ExampleWalletServiceTest } from './app/Wallet/services.test';
import { clearUserTable } from "./utils/clear-database.test";

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

app.loadMiddleware()
app.loadControllers()


describe("Test Suite", function () {
  before(async function () {
    await database.connect()
    clearUserTable(database)
  });
  after(function () { });

  ExampleServiceTest(database, userService)
  ExampleControllerTest(app)
  ExampleWalletServiceTest(database, walletService)
})