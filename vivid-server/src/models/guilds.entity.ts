import {
  Column,
  Entity,
  CreateDateColumn,
  Unique,
  Timestamp,
  OneToMany,
  BaseEntity,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Unique(['name'])
@Unique(['owner'])
@Unique(['anagram'])
@Entity({ name: 'guilds' })
export class GuildsEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('varchar', { default: null, length: 5 })
  anagram: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'owner' })
  owner: UserEntity;

  @CreateDateColumn()
  created_at: Timestamp;

  @Column('boolean', { default: true })
  active: boolean;

  @Column('numeric', { default: 0 })
  total_points: number;

  @Column('numeric', { default: 0 })
  wars_won: number;

  @Column('numeric', { default: 0 })
  wars_tied: number;

  @Column('numeric', { default: 0 })
  wars_lost: number;

  @Column('varchar', { default: null })
  current_war_id: string;

  @OneToMany(() => UserEntity, (user) => user.guild)
  users: UserEntity[];
}
