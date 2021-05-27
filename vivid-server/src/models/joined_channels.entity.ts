import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ChannelEntity } from './channel.entity';
import { UserEntity } from './user.entity';
import { IUser } from './user.interface';

@Entity('joined_channels')
export class JoinedChannelEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.joined_channels)
  user: string;

  @ManyToOne(() => ChannelEntity, (channel) => channel.joined_users)
  channel: string;
}

export class IJoinedChannel {
  id: number;
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
