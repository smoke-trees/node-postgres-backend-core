import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BasePolicy } from "./BasePolicy";
import { BaseUser } from "./BaseUser";
import { IUserPolicyCreate } from "./ISRN";

@Entity({ name: 'user_policy' })
export abstract class BaseUserPolicy extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column('uuid', { name: 'user_id' })
  userId!: string | number;

  @Column('uuid', { name: 'policy_id' })
  policyId!: string | number;

  abstract user?: BaseUser;

  abstract policy?: BasePolicy;

  constructor(employeePolicy?: IUserPolicyCreate) {
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
