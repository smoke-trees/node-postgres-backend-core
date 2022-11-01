import { RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { Application } from "../../core/app";
import { Controller, Methods } from "../../core/controller";
import { ServiceController } from "../../core/ServiceController";
import { UserPolicy } from "./user_policy.entity";
import { PolicyService } from "./user_policy.service";

export class UserPolicyController extends ServiceController<UserPolicy>  {
  public path = '/policy';
  protected controllers: Controller[];
  protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[];
  public service: PolicyService;
  constructor(app: Application, userService: PolicyService) {
    super(app, UserPolicy, userService);
    this.service = userService;
    this.controllers = [];
    this.mw = []
    this.loadDocumentation()
  }
}