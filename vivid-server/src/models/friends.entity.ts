import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Unique(['user_1', 'user_2'])
@Entity({ name: 'friends' })
export class FriendsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_1: string;

  @Column()
  user_2: string;

  @Column()
  requested_by: string;

  @Column()
  requested_to: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('boolean', { default: false })
  accepted: boolean;
}
