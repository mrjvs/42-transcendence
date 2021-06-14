import { JoinedChannelEntity } from './joined_channels.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
  JoinColumn, JoinTable
} from 'typeorm';
import { GuildsEntity } from './guilds.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // @Column({
  //   type: 'uuid',
  //   nullable: true,
  // })
  // guild_id: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => JoinedChannelEntity, (channel) => channel.user)
  joined_channels: JoinedChannelEntity[];

  @Column()
  intra_id: string;

  getName() {
    return this.name + '!!!';
  }

  @Column('boolean', { default: false })
  admin: boolean;

  @ManyToOne(() => GuildsEntity, (guild) => guild.users)
  @JoinTable({ name: 'guild' })
  guild: GuildsEntity;
}
