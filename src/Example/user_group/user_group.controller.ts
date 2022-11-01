import { RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { Application } from "../../core/app";
import { Controller, Methods } from "../../core/controller";
import { ServiceController } from "../../core/ServiceController";
import { UserGroup } from "./user_group.entity";
import { UserGroupService } from "./user_group.service";

export class UserGroupController extends ServiceController<UserGroup>  {
  public path = '/user-group';
  protected controllers: Controller[];
  protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[];
  public service: UserGroupService;
  constructor(app: Application, userService: UserGroupService) {
    super(app, UserGroup, userService);
    this.service = userService;
    this.controllers = [];
    this.mw = []
    this.loadDocumentation()
  }
}