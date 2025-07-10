import { ServiceController } from "../../core/ServiceController";
import { Application } from "../../core/app";
import { Controller } from "../../core/controller";
import { AddressService } from "./Address.service";
import { Address } from "./address.entity";

export class AddressController extends ServiceController<Address> {
  public path: string = "/address";
  protected controllers: Controller[] = [];
  protected mw = [];

  constructor(
    app: Application,
    public service: AddressService
  ) {
    super(app, Address, service);
  }
}
