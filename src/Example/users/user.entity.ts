import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Documentation } from "../../core/documentation/SmokeDocs";
import { Validator } from "../../core/Validator";
import { BaseUser } from "./baseUser";
import { IUser } from "./IUser";

@Documentation.addSchema({ type: "object", description: "User entity" })
@Entity({ name: 'user_test_table' })
export class User extends BaseUser implements IUser {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  @Documentation.addField({ type: "number", format: "int32", description: "User id" })
  id!: number;

  @Column('varchar', { name: 'name_user', length: 255 })
  @Validator({ required: true, updatable: true })
  @Documentation.addField({ type: "string", description: "Name of the user" })
  name!: string;

  @Column('varchar', { name: 'address', length: 255 })
  @Validator({ required: true, updatable: true })
  @Documentation.addField({ type: "string", description: "Name of the user" })
  address!: string;


  constructor(it?: Partial<IUser>) {
    super();
    if (it) {
      this.name = it.name!;
    }
  }
}
