import { RequestHandler, Router as ExpressRouter } from 'express'
export default abstract class Router {
  protected abstract mw: RequestHandler[];
  protected readonly router: ExpressRouter;
  constructor (router: ExpressRouter) {
    this.router = router
  }

  /**
   * Load middleware for the router
   */
  public loadMiddleware (): void {
    this.mw.forEach((mw) => {
      this.router.use(mw)
    })
  }

  /**
   * Set the middleware for the router 
   * @param mw Middleware to add to the router
   */
  protected setMiddleware (mw?: RequestHandler[]): void {
    this.mw = mw ?? []
  }
}
