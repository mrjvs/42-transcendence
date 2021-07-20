import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Unique,
  ManyToOne,
} from 'typeorm';
import { UserEntity } from '@/user.entity';

@Unique(['user_id', 'blocked_user_id'])
@Entity({ name: 'blocks' })
export class BlocksEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.blocks)
  user_id: string;

  @Column()
  blocked_user_id: string;

  @CreateDateColumn()
  createdAt: Date;
}
