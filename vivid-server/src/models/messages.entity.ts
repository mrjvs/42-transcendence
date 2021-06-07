import { IsNotEmpty } from 'class-validator';
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
}

export class IMessageInput {
  content: string;
  user: string;
  channel: string;
}

export class MessageDto {
  @IsNotEmpty()
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
