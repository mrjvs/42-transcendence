import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ChannelEntity } from './channel.entity';
import { UserEntity } from './user.entity';
import { IUser } from './user.interface';

@Unique('USER_JOIN', ['user', 'channel'])
@Entity('joined_channels')
export class JoinedChannelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
}

export class UserJoinedChannelDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}
