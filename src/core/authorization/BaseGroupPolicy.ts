import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BasePolicy } from "./BasePolicy";
import { BaseUser } from "./BaseUser";
import { IGroupPolicy, IGroupPolicyCreate } from "./ISRN";

@Entity({ name: 'group_policy' })
export abstract class BaseGroupPolicy extends BaseEntity implements IGroupPolicy {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column('uuid', { name: 'group_id' })
  groupId!: string | number;

  @Column('uuid', { name: 'policy_id' })
  policyId!: string | number;

  abstract user?: BaseUser;

  abstract policy?: BasePolicy;

  constructor(employeePolicy?: IGroupPolicyCreate) {
    super()
    if (employeePolicy) {
      const { id, groupId, policyId } = employeePolicy
      if (id) {
        this.id = id
      }
      this.groupId = groupId
      this.policyId = policyId
    }
  }
}
