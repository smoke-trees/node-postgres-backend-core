import { Service } from "../../core/Service";
import { PolicyDao } from "./user_policy.dao";
import { UserPolicy } from "./user_policy.entity";

export class PolicyService extends Service<UserPolicy> {
  dao: PolicyDao;
  constructor(userDao: PolicyDao) {
    super(userDao)
    this.dao = userDao
  }
}