import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseGroupPolicy } from "../../core/authorization/BaseGroupPolicy";
import { IBasePolicy } from "../../core/authorization/ISRN";
import { Documentation } from "../../core/documentation/SmokeDocs";
import { IGroupPolicy } from "./IGroupPolicy";

@Documentation.addSchema({ type: "object", description: "User entity" })
@Entity({ name: 'group_policy_test_table' })
export class GroupPolicy extends BaseGroupPolicy implements IGroupPolicy {
  constructor(it?: Partial<IBasePolicy>) {
    super();
    if (it) {
    }
  }
}
