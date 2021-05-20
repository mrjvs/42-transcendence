import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { JoinedChannelEntity } from './joined_channels.entity';

@Entity('channels')
export class ChannelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => JoinedChannelEntity, (channel) => channel.channel_id)
  joined_users: JoinedChannelEntity[];
}

export class IChannel {
  id: string;
  created_at: Date;
}

export class ChannelDto {}
