import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { BaseGroup } from "./BaseGroup";
import { BaseUser } from "./BaseUser";
import { IBaseUserGroup, IBaseUserGroupCreate } from "./ISRN";

@Entity({ name: 'user_group' })
export abstract class BaseUserGroup extends BaseEntity implements IBaseUserGroup {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string | number;

  @Column('uuid', { name: 'user_id' })
  userId!: string | number;

  @Column('uuid', { name: 'group_id' })
  groupId!: string | number;

  @ManyToOne(() => BaseGroup, group => group.userGroups, { eager: false })
  @JoinColumn({ name: 'group_id' })
  group?: BaseGroup;

  @ManyToOne(() => BaseUser, policy => policy.userGroups, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user?: BaseUser;

  constructor(userGroup?: IBaseUserGroupCreate) {
    super()
    if (userGroup) {
      const { id, userId, groupId } = userGroup
      if (id) {
        this.id = id
      }
      this.userId = userId
      this.groupId = groupId
    }
  }
}
