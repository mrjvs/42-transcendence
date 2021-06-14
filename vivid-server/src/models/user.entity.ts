import { JoinedChannelEntity } from './joined_channels.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GuildsEntity } from './guilds.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => JoinedChannelEntity, (channel) => channel.user)
  joined_channels: JoinedChannelEntity[];

  @Column()
  intra_id: string;

  getName() {
    return this.name + '!!!';
  }

  @Column('boolean', { default: false })
  admin: boolean;

  @ManyToOne(() => GuildsEntity, (guild) => guild.users, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'guild' })
  guild: GuildsEntity;
}
