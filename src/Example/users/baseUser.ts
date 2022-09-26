import { BaseEntity } from "../../core/BaseEntity";
import { Documentation } from "../../core/documentation/SmokeDocs";

export class BaseUser extends BaseEntity   {
  @Documentation.addField({ type: "string", format: "date-time", description: "Date Time" })
  dateOfBirth?: Date;
}