import { Service } from "../../core/Service";
import { AddressDao } from "./Address.dao";
import { Address } from "./address.entity";

export class AddressService extends Service<Address> {
  constructor(public dao: AddressDao) {
    super(dao);
  }
}
