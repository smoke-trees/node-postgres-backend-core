import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseUserPolicy } from "../../core/authorization/BaseUserPolicy";
import { IBasePolicy } from "../../core/authorization/ISRN";
import { Documentation } from "../../core/documentation/SmokeDocs";
import { IUserPolicy } from "./IUserPolicy";

@Documentation.addSchema({ type: "object", description: "User entity" })
@Entity({ name: 'user_policy_test_table' })
export class UserPolicy extends BaseUserPolicy implements IUserPolicy {
  constructor(it?: Partial<IBasePolicy>) {
    super();
    if (it) {
    }
  }
}
