import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ChannelEntity } from './channel.entity';

@Entity('joined_channels')
export class JoinedChannelEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => ChannelEntity, (channel) => channel.joined_users)
  channel_id: string;
}

export class IJoinedChannel {
  id: number;
  channel_id: string;
  user_id: string;
}

export class IJoinedChannelInput {
  channel_id: string;
  user_id: string;
}

export class UserJoinedChannelDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}
