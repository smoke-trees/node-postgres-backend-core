import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BasePolicy } from "../../core/authorization/BasePolicy";
import { IBasePolicy } from "../../core/authorization/ISRN";
import { Documentation } from "../../core/documentation/SmokeDocs";
import { IPolicy } from "./IPolicy";

@Documentation.addSchema({ type: "object", description: "User entity" })
@Entity({ name: 'policy_test_table' })
export class Policy extends BasePolicy implements IPolicy {
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name!: string;

  constructor(it?: Partial<IBasePolicy>) {
    super();
    if (it) {
    }
  }
}
