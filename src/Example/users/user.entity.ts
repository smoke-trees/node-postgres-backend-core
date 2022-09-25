import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../core/BaseEntity";
import { DocsField, DocsSchema, getRef, getSchema } from "../../core/documentation/schema";
import { Format, Type } from "../../core/documentation/types";
import { Validator } from "../../core/Validator";
import { Address } from "./address.entity";
import { IUser } from "./IUser";

@DocsSchema({ type: "object", description: "User entity" })
@Entity({ name: 'user_test_table' })
export class User extends BaseEntity implements IUser {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  @DocsField({ type: "number", format: "int32", description: "User id" })
  id!: number;

  @Column('varchar', { name: 'name_user', length: 255 })
  @Validator({ required: true, updatable: true })
  @DocsField({ type: "string", description: "Name of the user" })
  name!: string;

  @DocsField({ type: "object", $ref: getRef(Address) })
  address!: Address;

  constructor(it?: Partial<IUser>) {
    super();
    if (it) {
      this.name = it.name!;
    }
  }
}
