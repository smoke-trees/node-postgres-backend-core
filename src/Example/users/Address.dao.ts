import { Dao } from "../../core/Dao";
import Database from "../../core/database";
import { Address } from "./address.entity";

export class AddressDao extends Dao<Address> {
  constructor(database: Database) {
    super(database, Address, "address");
  }
}
