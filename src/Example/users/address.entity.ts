import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../core/BaseEntity";
import { DocsField, DocsSchema } from "../../core/documentation/schema";
import { Validator } from "../../core/Validator";
import { IUser } from "./IUser";

@DocsSchema({ type: "object", description: "Address Entity" })
@Entity({ name: 'address' })
export class Address extends BaseEntity implements IUser {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  @DocsField({ type: "number", format: "int32", description: "Address" })
  id!: number;

  @Column('varchar', { name: 'name_user', length: 255 })
  @Validator({ required: true, updatable: true })
  @DocsField({ type: "string", description: "Name of the address" })
  name!: string;

  constructor(it?: Partial<IUser>) {
    super();
    if (it) {
      this.name = it.name!;
    }
  }
}
