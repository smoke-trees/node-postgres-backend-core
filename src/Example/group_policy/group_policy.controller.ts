import { RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { Application } from "../../core/app";
import { Controller, Methods } from "../../core/controller";
import { ServiceController } from "../../core/ServiceController";
import { GroupPolicy } from "./group_policy.entity";
import { GroupPolicyService } from "./group_policy.service";

export class GroupPolicyController extends ServiceController<GroupPolicy>  {
  public path = '/group-policy';
  protected controllers: Controller[];
  protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[];
  public service: GroupPolicyService;
  constructor(app: Application, userService: GroupPolicyService) {
    super(app, GroupPolicy, userService);
    this.service = userService;
    this.controllers = [];
    this.mw = []
    this.loadDocumentation()
  }
}