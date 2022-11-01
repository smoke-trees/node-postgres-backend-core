import { RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { Application } from "../../core/app";
import { Controller, Methods } from "../../core/controller";
import { ServiceController } from "../../core/ServiceController";
import { Group } from "./group.entity";
import { GroupService } from "./group.service";

export class GroupController extends ServiceController<Group>  {
  public path = '/group';
  protected controllers: Controller[];
  protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[];
  public service: GroupService;
  constructor(app: Application, userService: GroupService) {
    super(app, Group, userService);
    this.service = userService;
    this.controllers = [];
    this.mw = []
    this.loadDocumentation()
  }
}