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
  ManyToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { WarEntity } from './war.entity';

@Unique(['name'])
@Unique(['owner'])
@Unique(['anagram'])
@Entity({ name: 'guilds' })
export class GuildsEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(
    () => WarEntity,
    (war) => war.requesting_guild && war.accepting_guild,
  )
  @Column('varchar', { default: null, length: 5 })
  anagram: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'owner' })
  owner: UserEntity;

  @CreateDateColumn()
  created_at: Timestamp;

  @Column('boolean', { default: true })
  active: boolean;

  @Column({ default: 0 })
  total_points: number;

  @Column({ default: 0 })
  wars_won: number;

  @Column({ default: 0 })
  wars_tied: number;

  @Column({ default: 0 })
  wars_lost: number;

  @ManyToOne(() => WarEntity, (war) => war.guilds)
  @JoinColumn({ name: 'war' })
  current_war: WarEntity;

  @OneToMany(() => UserEntity, (user) => user.guild)
  users: UserEntity[];
}
