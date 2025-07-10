import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BaseEntity } from "../../core/BaseEntity";
import { Documentation } from "../../core/documentation/SmokeDocs";
import { IAddress } from "./IUser";
import { User } from "./user.entity";

@Documentation.addSchema()
@Entity({ name: "address" })
export class Address extends BaseEntity implements IAddress {
  @PrimaryGeneratedColumn("increment", { name: "id" })
  @Documentation.addField({
    type: "number",
    format: "int32",
    description: "Address",
  })
  id!: number;

  @Column("varchar", { name: "name_address", length: 255 })
  @Documentation.addField({
    type: "string",
    description: "Name of the address",
  })
  name1!: string;

  @Column({ name: "user_id", type: "bigint" })
  userId!: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: "user_id" })
  user?: User;

  constructor(it?: Partial<IAddress>) {
    super();
    if (it) {
      this.name1 = it.name1!;
      this.userId = it.userId!;
    }
  }
}
