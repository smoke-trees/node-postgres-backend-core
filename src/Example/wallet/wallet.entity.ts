import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseResource } from "../../core/authorization/BaseResource";
import { Documentation } from "../../core/documentation/SmokeDocs";
import { Validator } from "../../core/Validator";
import { IWallet } from "./IWallet";

@Documentation.addSchema({ type: "object", description: "User entity" })
@Entity({ name: 'wallet_test_table' })
export class Wallet extends BaseResource implements IWallet {
  projectName = "Example";
  serviceName = "wallet";
  resourcePath = "userWallet";

  @PrimaryGeneratedColumn('increment', { name: 'id' })
  @Documentation.addField({ type: "number", format: "int32", description: "User id" })
  id!: number;

  @Column('int', { name: 'points' })
  @Validator({ required: true, updatable: true })
  @Documentation.addField({ type: "number", description: "Name of the user" })
  points!: number;


  constructor(it?: Partial<IWallet>) {
    super();
    if (it) {
      this.points = it.points!;
    }
  }
}
