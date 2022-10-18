import { BaseEntity, Column } from "typeorm";

export abstract class BaseGroup extends BaseEntity {
  abstract id: string | number;
}