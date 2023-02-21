import express, { Application as ExpressApplication, RequestHandler } from 'express'
import { Server } from 'http'
import log from './log'
import { Controller } from './controller'
import RouteHandler from './RouteHandler'
import Database from './database'
import { Settings } from './settings'

/**
 * @class Application
 * 
 */
export class Application extends RouteHandler {
  private readonly app: ExpressApplication
  private readonly controllers: Controller[];
  protected readonly port: string;
  protected mw: RequestHandler[];
  public settings: Settings;
  public database: Database | null;

  /**
   * Creates a Application which can run as a server 
   * @param settings Settings Object to be used by the application
   */
  constructor(settings: Settings);
  /**
   * Creates a Application which can run as a server 
   * @param settings Settings Object to be used by the application
   * @param database Database Object to be used by the application 
   */
  constructor(settings: Settings, database: Database);

  constructor(settings: Settings = new Settings(), db?: Database) {
    const app = express()
    super(app)
    this.app = app
    this.settings = settings
    this.port = process.env.PORT || '8080'
    this.controllers = []
    this.mw = []
    this.setMiddleware()
    this.database = db ?? null
  }


  /**
   * Loads all the middlewares added to the application 
   * @returns Returns the HTTP Server running the application
   */
  public async run(): Promise<Server> {
    return this.app.listen(this.port, () => {
      log.info(`Started server on port ${this.port}`, 'Application.run')
    })
  }

  /**
   * Loads all the middlewares added to the application 
   * @returns Returns the express application
   */
  public getApp(): ExpressApplication {
    return this.app
  }

  /**
   * Loads all the controllers added to the application
   */
  public loadControllers(): void {
    this.controllers.forEach((controller) => {
      this.app.use(controller.path, controller.setRoutes())
    })
    this.app.use('/health', (req, res) => { res.status(209).json({ message: "Health is wealth. An apple a day keep doctors away." }) })
    this.app.use('*', (req, res) => { res.status(404).json({ message: "Not Found" }) })
  }

  /**
   * Adds a controller to the application 
   * @param controller Controller to be added to the application
   */
  public addController(controller: Controller): void {
    this.controllers.push(controller)
  }

  /**
   * Adds global middlewares to the application 
   * @param middleware Middlewares to be added to the application
   */
  public addMiddleWare(...middleware: RequestHandler[]): void {
    this.mw.push(...middleware)
  }
}
