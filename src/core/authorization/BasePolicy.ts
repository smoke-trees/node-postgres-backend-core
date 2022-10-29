import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseRule } from "./BaseRule";
import { BaseUserPolicy } from "./BaseUserPolicy";
import { IPolicy, IPolicyCreate, IRequestActionWithResourceDetails, ResourceMatchResponse } from "./ISRN";

@Entity({ name: 'policy' })
export abstract class BasePolicy extends BaseEntity implements IPolicy {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string | number;

  @Column({ name: 'rules', type: 'json' })
  rules!: BaseRule[];

  abstract userPolicies?: BaseUserPolicy;

  constructor(policy?: IPolicyCreate) {
    super()
    if (policy) {
      const { id, rules } = policy
      // this.rules = rules
      if (id) {
        this.id = id
      }
    }
  }

  doesPolicyAllowRequest(requestAction: IRequestActionWithResourceDetails): ResourceMatchResponse {
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
