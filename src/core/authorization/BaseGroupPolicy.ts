import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { BaseGroup } from "./BaseGroup";
import { BasePolicy } from "./BasePolicy";
import { IBaseGroupPolicy, IBaseGroupPolicyCreate } from "./ISRN";

@Entity({ name: 'group_policy' })
export abstract class BaseGroupPolicy extends BaseEntity implements IBaseGroupPolicy {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string | number;

  @Column('uuid', { name: 'group_id' })
  groupId!: string | number;

  @Column('uuid', { name: 'policy_id' })
  policyId!: string | number;

  @ManyToOne(() => BaseGroup, group => group.groupPolicies, { eager: false })
  @JoinColumn({ name: 'group_id' })
  group?: BaseGroup;

  @ManyToOne(() => BasePolicy, policy => policy.groupPolicies, { eager: false })
  @JoinColumn({ name: 'policy_id' })
  policy?: BasePolicy;

  constructor(groupPolicy?: IBaseGroupPolicyCreate) {
    super()
    if (groupPolicy) {
      const { id, groupId, policyId } = groupPolicy
      if (id) {
        this.id = id
      }
      this.groupId = groupId
      this.policyId = policyId
    }
  }
}
