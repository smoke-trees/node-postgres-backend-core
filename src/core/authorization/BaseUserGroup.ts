import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseGroup } from "./BaseGroup";
import { BaseUser } from "./BaseUser";
import { IUserGroup, IUserGroupCreate } from "./ISRN";

@Entity({ name: 'user_group' })
export abstract class BaseUserGroup extends BaseEntity implements IUserGroup {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string | number;

  @Column('uuid', { name: 'user_id' })
  userId!: string | number;

  @Column('uuid', { name: 'group_id' })
  groupId!: string | number;

  abstract user?: BaseUser;

  abstract group?: BaseGroup;

  constructor(userPolicy?: IUserGroupCreate) {
    super()
    if (userPolicy) {
      const { id, userId, groupId } = userPolicy
      if (id) {
        this.id = id
      }
      this.userId = userId
      this.groupId = groupId
    }
  }
}
