import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseUserPolicy } from "./BaseUserPolicy";
import { IPolicy, IPolicyCreate, IRule } from "./ISRN";

@Entity({ name: 'policy' })
export abstract class BasePolicy extends BaseEntity implements IPolicy {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string | number;

  @Column({ name: 'rules', type: 'json' })
  rules!: IRule[];

  abstract userPolicies?: BaseUserPolicy;

  constructor(policy?: IPolicyCreate) {
    super()
    if (policy) {
      const { id, rules } = policy
      this.rules = rules
      if (id) {
        this.id = id
      }
    }
  }
}
