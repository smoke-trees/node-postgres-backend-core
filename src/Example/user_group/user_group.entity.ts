import { Entity } from "typeorm";
import { BaseUserGroup } from "../../core/authorization/BaseUserGroup";
import { IBasePolicy } from "../../core/authorization/ISRN";
import { Documentation } from "../../core/documentation/SmokeDocs";
import { IUserGroup } from "./IUserGroup";

@Documentation.addSchema({ type: "object", description: "User entity" })
@Entity({ name: 'user_group_test_table' })
export class UserGroup extends BaseUserGroup implements IUserGroup {
  constructor(it?: Partial<IBasePolicy>) {
    super();
    if (it) {
    }
  }
}
