import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../core/BaseEntity";
import { Validator } from "../../core/Validator";
import { Documentation } from "../../core/documentation/SmokeDocs";
import { IUser } from "./IUser";

@Documentation.addSchema()
@Entity({ name: "address" })
export class Address extends BaseEntity implements IUser {
  @PrimaryGeneratedColumn("increment", { name: "id" })
  @Documentation.addField({
    type: "number",
    format: "int32",
    description: "Address",
  })
  id!: number;

  @Column("varchar", { name: "name_user", length: 255 })
  @Validator({ required: true, updatable: true })
  @Documentation.addField({
    type: "string",
    description: "Name of the address",
  })
  name!: string;

  constructor(it?: Partial<IUser>) {
    super();
    if (it) {
      this.name = it.name!;
    }
  }
}
