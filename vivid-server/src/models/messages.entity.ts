import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

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
