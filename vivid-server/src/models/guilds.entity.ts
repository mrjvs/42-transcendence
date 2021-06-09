import {
  Column,
  Entity,
  CreateDateColumn,
  Unique,
  Timestamp,
  PrimaryColumn,
} from 'typeorm';

@Unique(['name'])
@Unique(['owner'])
@Unique(['anagram'])
@Entity({ name: 'guilds' })
export class GuildsEntity {
  @PrimaryColumn()
  name: string;

  @Column('varchar', { default: null, length: 5 })
  anagram: string;

  @Column()
  owner: string;

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
}
