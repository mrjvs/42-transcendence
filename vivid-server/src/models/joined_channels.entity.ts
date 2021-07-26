import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  Column,
} from 'typeorm';
import { IsBoolean, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';
import { ChannelEntity } from '@/channel.entity';
import { IUser, UserEntity } from '@/user.entity';

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
  muted_expiry?: Date;

  // banning
  @Column({ default: false })
  is_banned: boolean;

  @Column({ default: null, nullable: true })
  ban_expiry?: Date;

  // state
  @Column({ default: true })
  is_joined: boolean;

  // relations
  @Column({ type: 'uuid' })
  @ManyToOne(() => UserEntity, (user) => user.joined_channels)
  user: string;

  @Column({ type: 'uuid' })
  @ManyToOne(() => ChannelEntity, (channel) => channel.joined_users)
  channel: string;
}

export class IJoinedChannel {
  id: string;
  user: string | IUser;
}

export class IJoinedChannelInput {
  channel: string;
  user: string;
  password?: string;
}

export class UserJoinedChannelDto {
  @IsOptional()
  @IsNotEmpty()
  password: string;
}

export class UserPunishmentsDto {
  @IsOptional()
  @IsBoolean()
  isMuted?: boolean;

  @IsOptional()
  @IsBoolean()
  isBanned?: boolean;

  @IsOptional()
  @IsPositive()
  muteExpiry?: number;

  @IsOptional()
  @IsPositive()
  banExpiry?: number;
}

export class UserPermissionDto {
  @IsBoolean()
  isMod: boolean;
}
