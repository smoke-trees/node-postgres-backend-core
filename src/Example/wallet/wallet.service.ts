import { Service } from "../../core/Service";
import { WalletDao } from "./wallet.dao";
import { Wallet } from "./wallet.entity";

export class WalletService extends Service<Wallet> {
  dao: WalletDao;
  constructor(userDao: WalletDao) {
    super(userDao)
    this.dao = userDao
  }
}