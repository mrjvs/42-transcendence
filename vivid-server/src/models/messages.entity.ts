import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { addons } from '~/constants';

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  content: string;

  @Column({ type: 'json', nullable: true, default: null })
  aux_content: IAuxContent;

  @Column({ default: 0 })
  message_type: number;

  @Column({ type: 'uuid' })
  user: string;

  @Column({ type: 'uuid' })
  channel: string;
}

export class IMessage {
  id: string;
  created_at: Date;
  user: string;
  channel: string;
  content: string;
  aux_content: IAuxContent;
  message_type: number;
}

export enum MessageTypes {
  PLAIN = 0,
  GAME_INVITE = 1,
  JOIN = 2,
  LEAVE = 3,
}

export class IMessageInput {
  content: string;
  message_type?: number;
  aux_content?: IAuxContent;
  user: string;
  channel: string;
}

export class MessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}

export function IsAddonList(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isAddonList',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          let foundWrong = false;
          value.forEach((v: any) => {
            if (v.constructor !== String) foundWrong = true;
            else if (!addons.includes(v as string)) foundWrong = true;
          });
          return !foundWrong;
        },
      },
    });
  };
}

export class AddonDto {
  @IsOptional()
  @IsArray()
  @IsAddonList()
  addons: string[];
}

export class PaginationDto {
  @IsOptional()
  @IsDate()
  date1: Date;

  @IsOptional()
  @IsDate()
  date2: Date;
}

export interface IAuxContent {
  invite_game_id: string;
}
