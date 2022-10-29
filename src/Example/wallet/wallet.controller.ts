import { RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { Application } from "../../core/app";
import { Controller, Methods } from "../../core/controller";
import { Documentation } from "../../core/documentation/SmokeDocs";
import { ServiceController } from "../../core/ServiceController";
import { Wallet } from "./wallet.entity";
import { WalletService } from "./wallet.service";

export class WalletController extends ServiceController<Wallet>  {
  public path = '/wallet';
  protected controllers: Controller[];
  protected mw: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>[];
  public service: WalletService;
  constructor(app: Application, userService: WalletService) {
    super(app, Wallet, userService);
    this.service = userService;
    this.controllers = [];
    this.mw = []
    this.loadDocumentation()
  }
}