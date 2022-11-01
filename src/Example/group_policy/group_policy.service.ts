import { Service } from "../../core/Service";
import { GroupPolicyDao } from "./group_policy.dao";
import { GroupPolicy } from "./group_policy.entity";

export class GroupPolicyService extends Service<GroupPolicy> {
  dao: GroupPolicyDao;
  constructor(userDao: GroupPolicyDao) {
    super(userDao)
    this.dao = userDao
  }
}