import { BaseEntity } from "typeorm";

export abstract class BaseUser extends BaseEntity {
  abstract id: string | number;
}