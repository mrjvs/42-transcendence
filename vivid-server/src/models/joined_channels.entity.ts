import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  Column,
} from 'typeorm';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ChannelEntity } from './channel.entity';
import { UserEntity } from './user.entity';
import { IUser } from './user.interface';
import { Optional } from '@nestjs/common';

@Unique('USER_JOIN', ['user', 'channel'])
@Entity('joined_channels')
export class JoinedChannelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // permissions
  @Column({ default: false })
  is_mod: boolean;

  // muting
  @Column({ default: false })
  is_muted: boolean;

  @Column({ default: null, nullable: true })
  muted_expiry: Date;

  // banning
  @Column({ default: false })
  is_banned: boolean;

  @Column({ default: null, nullable: true })
  ban_expiry: Date;

  // state
  @Column({ default: true })
  is_joined: boolean;

  // relations
  @ManyToOne(() => UserEntity, (user) => user.joined_channels)
  user: string;

  @ManyToOne(() => ChannelEntity, (channel) => channel.joined_users)
  channel: string;
}

export class IJoinedChannel {
  id: string;
  channel: string;
  user: string | IUser;
}

export class IJoinedChannelInput {
  channel: string;
  user: string;
  password?: string;
}

export class UserJoinedChannelDto {
  @Optional()
  @IsNotEmpty()
  password: string;
}
