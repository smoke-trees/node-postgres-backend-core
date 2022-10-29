import Database from "../../core/database";
import { User } from "../../Example/users";
import { Wallet } from "../../Example/wallet";

export function clearUserTable(database: Database) {
  return database.getConnection().getRepository(User).clear()
}

export function clearWalletTable(database: Database) {
  return database.getConnection().getRepository(Wallet).clear()
}