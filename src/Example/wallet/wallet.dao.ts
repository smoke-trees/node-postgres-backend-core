import { Dao } from "../../core/Dao";
import Database from "../../core/database";
import { Wallet } from "./wallet.entity";

export class WalletDao extends Dao<Wallet> {
  constructor(database: Database) {
    super(database, Wallet, "wallet");
  }
}