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
import { MatchesEntity } from './matches.entity';
import { IsString } from 'class-validator';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // TODO unique name
  @Column({ nullable: true, default: null })
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

  @JoinColumn({ name: 'guild' })
  @ManyToOne(() => GuildsEntity, (guild) => guild.users, {
    onDelete: 'SET NULL'})
  @JoinColumn({ name: 'guild' })
  guild: GuildsEntity;

  @OneToMany(() => MatchesEntity, (matches) => matches.user_req)
  matches_req: MatchesEntity[];

  @OneToMany(() => MatchesEntity, (matches) => matches.user_acpt)
  matches_acpt: MatchesEntity[];


  //   onDelete: 'SET NULL',
  // })
  // guild: GuildsEntity;

  @Column({ nullable: true, type: 'json' })
  twofactor: {
    secret: string;
    backupCodes: string[];
  };

  // permissions
  isSiteAdmin() {
    return this.site_admin;
  }

  hasTwoFactorEnabled() {
    return this.twofactor !== null;
  }

  // TODO add guards for account not being setup
  isAccountSetup() {
    // return this.name && this.name.length > 0;
    return true;
  }
}

export class UsernameChangeDto {
  @IsString()
  username: string;
}
