import { Service } from "../../core/Service";
import { PolicyDao } from "./policy.dao";
import { Policy } from "./policy.entity";

export class PolicyService extends Service<Policy> {
  dao: PolicyDao;
  constructor(userDao: PolicyDao) {
    super(userDao)
    this.dao = userDao
  }
}