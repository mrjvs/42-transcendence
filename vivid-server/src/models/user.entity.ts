import { JoinedChannelEntity } from './joined_channels.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { GuildsEntity } from './guilds.entity';
import { IsNotEmpty, IsString } from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';
import { MatchesEntity } from './matches.entity';
import { BlocksEntity } from '@/blocks.entity';
import { FriendsEntity } from './friends.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, default: null, unique: true })
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => JoinedChannelEntity, (channel) => channel.user)
  joined_channels: JoinedChannelEntity[];

  @Column()
  intra_id: string;

  @Column({ default: false })
  site_admin: boolean;

  @Column({ type: 'json' })
  avatar_colors: string[];

  @Column({ default: null })
  avatar: string;

  @JoinColumn({ name: 'guild' })
  @ManyToOne(() => GuildsEntity, (guild) => guild.users, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'guild' })
  guild: GuildsEntity;

  @OneToMany(() => MatchesEntity, (matches) => matches.user_req)
  matches_req: MatchesEntity[];

  @OneToMany(() => MatchesEntity, (matches) => matches.user_acpt)
  matches_acpt: MatchesEntity[];

  @OneToMany(() => BlocksEntity, (blocks) => blocks.user_id)
  blocks: BlocksEntity[];

  @OneToMany(() => FriendsEntity, (friends) => friends.user_1)
  friends: FriendsEntity[];

  @OneToMany(() => FriendsEntity, (friends) => friends.user_2)
  friends_inverse: FriendsEntity[];

  //   onDelete: 'SET NULL',
  // })
  // guild: GuildsEntity;

  @Column({ nullable: true, type: 'text' })
  twofactor: string;

  // permissions
  isSiteAdmin() {
    return this.site_admin;
  }

  hasTwoFactorEnabled() {
    return this.twofactor !== null;
  }

  isAccountSetup() {
    return this.name && this.name.length > 0;
  }
}

export class UsernameChangeDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}

export interface INewUser {
  intra_id: string;
}

export interface IUser {
  intra_id: string;
  name: string;
  avatar_colors: string[];
}

export class UnrelatedUser {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() avatar_colors: string[];
  @Expose() avatar?: string;
}

export class RelatedUser extends UnrelatedUser {
  @Expose() intra_id: string;
  @Expose() site_admin: boolean;

  @Expose()
  @Transform(
    ({ obj, value }) =>
      value.constructor === String
        ? value
        : obj.joined_channels
            .filter((v: any) => v.is_joined)
            .map((v: any) =>
              v.channel.constructor === String ? v.channel : v.channel.id,
            ),
    { toClassOnly: true },
  )
  joined_channels: string[] | string;
}

function friendTransform(arr, userField, friendField) {
  return arr.map((v) =>
    v.constructor === String
      ? v
      : {
          id: v.id,
          userId: v[userField],
          friend: v[friendField],
          requested_by: v.requested_by,
          requested_to: v.requested_to,
          accepted: v.accepted,
        },
  );
}

@Exclude()
export class FullDetailsUser extends RelatedUser {
  @Expose()
  @Transform(
    ({ obj }) => [
      ...friendTransform(obj.friends, 'user_1', 'user_2'),
      ...friendTransform(obj.friends_inverse, 'user_2', 'user_1'),
    ],
    { toClassOnly: true },
  )
  friends: any;

  @Expose()
  @Transform(({ obj }) => obj.joined_channels, { toClassOnly: true })
  joined_channels: any;

  @Expose()
  @Transform(({ value }) => !!value)
  twofactor: any;

  @Expose()
  get twoFactorEnabled() {
    return !!this.twofactor;
  }

  @Expose()
  @Transform(
    ({ obj, value }) =>
      value.constructor === String
        ? value
        : obj.blocks?.map((v: any) =>
            v.constructor === String ? v : v.blocked_user_id,
          ),
    { toClassOnly: true },
  )
  blocks: any;
}
