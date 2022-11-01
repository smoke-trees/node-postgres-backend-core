import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BasePolicy as BaseGroup } from "../../core/authorization/BasePolicy";
import { IBasePolicy } from "../../core/authorization/ISRN";
import { Documentation } from "../../core/documentation/SmokeDocs";
import { IGroup } from "./IGroup";

@Documentation.addSchema({ type: "object", description: "User entity" })
@Entity({ name: 'group_test_table' })
export class Group extends BaseGroup implements IGroup {
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name!: string;

  constructor(it?: Partial<IBasePolicy>) {
    super();
    if (it) {
    }
  }
}
