import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { BaseGroupPolicy } from "./BaseGroupPolicy";
import { BaseRule } from "./BaseRule";
import { BaseUserPolicy } from "./BaseUserPolicy";
import { IBasePolicy, IBaseRequestAction, ResourceMatchResponse } from "./ISRN";

@Entity({ name: 'policy' })
export abstract class BasePolicy extends BaseEntity implements IBasePolicy {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string | number;

  @Column({ name: 'rules', type: 'json' })
  rules!: BaseRule[];

  @OneToMany(() => BaseUserPolicy, userPolicy => userPolicy.policy, {
    eager: true,
    cascade: ['remove', 'soft-remove']
  })
  userPolicies?: BaseUserPolicy[];

  @OneToMany(() => BaseGroupPolicy, groupPolicy => groupPolicy.policy, {
    eager: true,
    cascade: ['remove', 'soft-remove']
  })
  groupPolicies?: BaseGroupPolicy[];

  constructor(policy?: IBasePolicy) {
    super()
    if (policy) {
      const { id, rules } = policy
      this.rules = rules
      if (id) {
        this.id = id
      }
    }
  }

  doesPolicyAllowRequest(requestAction: IBaseRequestAction): ResourceMatchResponse {
    let matchResponses: ResourceMatchResponse[] = []
    for (let rule of this.rules) {
      let response: ResourceMatchResponse = rule.doesRuleAllowRequest(requestAction)
      /// If any rule in policy is deny, deny the request (Deny overrides allow)
      if (response === ResourceMatchResponse.DENY) {
        return ResourceMatchResponse.DENY
      }
      matchResponses.push(response)
    }
    /// If any rule in policy is allow, allow the request (allow overrides unmatched)
    if (matchResponses.includes(ResourceMatchResponse.ALLOW)) {
      return ResourceMatchResponse.ALLOW
    }
    return ResourceMatchResponse.UNMATCHED
  }
}
