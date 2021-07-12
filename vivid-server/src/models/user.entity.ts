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
import { IsNotEmpty, IsString } from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { MatchesEntity } from './matches.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, default: null, unique: true })
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

  @Column({ default: null })
  avatar: string;

  @JoinColumn({ name: 'guild' })
  @ManyToOne(() => GuildsEntity, (guild) => guild.users, {
    onDelete: 'SET NULL',
  })
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

  isAccountSetup() {
    return this.name && this.name.length > 0;
  }
}

export class UsernameChangeDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}

export interface INewUser {
  intra_id: string;
}

export interface IUser {
  intra_id: string;
  name: string;
  avatar_colors: string[];
}

export class UnrelatedUser {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() avatar_colors: string[];
  @Expose() avatar?: string;
}

export class RelatedUser extends UnrelatedUser {
  @Expose() intra_id: string;
  @Expose() site_admin: boolean;

  @Expose()
  @Transform(
    ({ obj, value }) =>
      value.constructor === String
        ? value
        : obj.joined_channels
            .filter((v: any) => v.is_joined)
            .map((v: any) =>
              v.channel.constructor === String ? v.channel : v.channel.id,
            ),
    { toClassOnly: true },
  )
  joined_channels: string[] | string;
}

export class FullDetailsUser extends RelatedUser {
  @Expose()
  @Transform(({ obj }) => obj.joined_channels, { toClassOnly: true })
  joined_channels: any;

  private twofactor: any;

  @Expose()
  get twoFactorEnabled() {
    return !!this.twofactor;
  }
}
