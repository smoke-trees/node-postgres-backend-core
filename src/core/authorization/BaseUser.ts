import { OneToMany } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { BaseUserGroup } from "./BaseUserGroup";
import { BaseUserPolicy } from "./BaseUserPolicy";

export abstract class BaseUser extends BaseEntity {
  abstract id: string | number;

  @OneToMany(() => BaseUserPolicy, (userPolicy) => userPolicy.user, {
    eager: true,
    cascade: ['remove', 'soft-remove', 'update'],
  })
  userPolicies?: BaseUserPolicy[];

  @OneToMany(() => BaseUserGroup, (userGroup) => userGroup.user, {
    eager: true,
    cascade: ['remove', 'soft-remove', 'update'],
  })
  userGroups?: BaseUserGroup[];
}