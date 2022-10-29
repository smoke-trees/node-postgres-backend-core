import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../core/BaseEntity";
import { Documentation } from "../../core/documentation/SmokeDocs";
import { Validator } from "../../core/Validator";
import { IWallet } from "./IWallet";

@Documentation.addSchema({ type: "object", description: "User entity" })
@Entity({ name: 'wallet_test_table' })
export class Wallet extends BaseEntity implements IWallet {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  @Documentation.addField({ type: "number", format: "int32", description: "User id" })
  id!: number;

  @Column('varchar', { name: 'name_user', length: 255 })
  @Validator({ required: true, updatable: true })
  @Documentation.addField({ type: "string", description: "Name of the user" })
  name!: string;


  constructor(it?: Partial<IWallet>) {
    super();
    if (it) {
      this.name = it.name!;
    }
  }
}
