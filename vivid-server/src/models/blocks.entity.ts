import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Unique(['user_id', 'blocked_user_id'])
@Entity({ name: 'blocks' })
export class BlocksEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  blocked_user_id: string;

  @CreateDateColumn()
  createdAt: Date;
}
