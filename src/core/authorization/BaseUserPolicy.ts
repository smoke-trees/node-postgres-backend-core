import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { BasePolicy } from "./BasePolicy";
import { BaseUser } from "./BaseUser";
import { IBaseUserPolicyCreate } from "./ISRN";

@Entity({ name: 'user_policy' })
export abstract class BaseUserPolicy extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string | number;

  @Column('uuid', { name: 'user_id' })
  userId!: string | number;

  @Column('uuid', { name: 'policy_id' })
  policyId!: string | number;

  @ManyToOne(() => BasePolicy, policy => policy.userPolicies, { eager: false })
  @JoinColumn({ name: 'policy_id' })
  policy?: BasePolicy;

  @ManyToOne(() => BaseUser, user => user.userPolicies, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user?: BaseUser;

  constructor(employeePolicy?: IBaseUserPolicyCreate) {
    super()
    if (employeePolicy) {
      const { id, userId, policyId } = employeePolicy
      if (id) {
        this.id = id
      }
      this.userId = userId
      this.policyId = policyId
    }
  }
}
