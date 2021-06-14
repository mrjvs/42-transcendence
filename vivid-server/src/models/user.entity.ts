import { JoinedChannelEntity } from './joined_channels.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  JoinTable,
  BaseEntity,
} from 'typeorm';
import { GuildsEntity } from './guilds.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
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

  @ManyToOne(() => GuildsEntity, (guild) => guild.users)
  @JoinColumn({ name: 'guild' })
  guild: GuildsEntity;
}
