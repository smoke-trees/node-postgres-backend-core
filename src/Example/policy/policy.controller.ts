import { RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { Application } from "../../core/app";
import { Controller, Methods } from "../../core/controller";
import { Documentation } from "../../core/documentation/SmokeDocs";
import { ServiceController } from "../../core/ServiceController";
import { Policy } from "./policy.entity";
import { PolicyService } from "./policy.service";

export class PolicyController extends ServiceController<Policy>  {
  public path = '/policy';
  protected controllers: Controller[];
  protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[];
  public service: PolicyService;
  constructor(app: Application, userService: PolicyService) {
    super(app, Policy, userService);
    this.service = userService;
    this.controllers = [];
    this.mw = []
    this.loadDocumentation()
  }
}