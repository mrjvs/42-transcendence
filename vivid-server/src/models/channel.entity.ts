import {
  IsNotEmpty,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { JoinedChannelEntity } from './joined_channels.entity';

@Entity('channels')
export class ChannelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  owner: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ default: false })
  is_public: boolean;

  @Column({ default: false })
  has_password: boolean;

  @Column({ default: '' })
  password: string;

  @Column({ nullable: false, default: '' })
  title: string;

  @OneToMany(() => JoinedChannelEntity, (channel) => channel.channel)
  joined_users: JoinedChannelEntity[];
}

export class IChannel {
  is_public?: boolean;
  has_password?: boolean;
  password?: string;
  title: string;
  owner: string;
}

@ValidatorConstraint()
export class PasswordCheck implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (!(args.object as any).hasPassword) return true; // no password, allow passing
    return text !== null && text !== undefined && text.length > 0;
  }
}

export class ChannelDto {
  @IsNotEmpty()
  hasPassword: boolean;

  @Validate(PasswordCheck, [], {
    message: 'password cannot be empty if hasPassword is set',
  })
  password: string;

  @IsNotEmpty()
  isPublic: boolean;

  @IsNotEmpty()
  title: string;
}
