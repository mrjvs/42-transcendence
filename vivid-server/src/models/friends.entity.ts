import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Unique,
  Check,
  ManyToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Unique(['user_1', 'user_2'])
@Check(`"user_1" < "user_2"`)
@Entity({ name: 'friends' })
export class FriendsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.friends)
  @Column()
  user_1: string;

  @ManyToOne(() => UserEntity, (user) => user.friends_inverse)
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
