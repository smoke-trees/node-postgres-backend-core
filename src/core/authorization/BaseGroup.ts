import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { BaseGroupPolicy } from "./BaseGroupPolicy";
import { BaseUserGroup } from "./BaseUserGroup";
import { IBaseGroup } from "./ISRN";

@Entity({ name: 'group' })
export abstract class BaseGroup extends BaseEntity implements IBaseGroup {
  abstract id: string | number;

  @OneToMany(() => BaseGroupPolicy, groupPolicy => groupPolicy.group, {
    eager: true,
    cascade: ['remove', 'soft-remove']
  })
  groupPolicies?: BaseGroupPolicy[]

  @OneToMany(() => BaseUserGroup, userGroup => userGroup.group, {
    eager: true,
    cascade: ['remove', 'soft-remove']
  })
  userGroups?: BaseUserGroup[]
}