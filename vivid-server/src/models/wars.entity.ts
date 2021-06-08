import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

// @Unique(['guild_1', 'guild_2'])
// @Check(`"guild_1" < "guild_2"`)
@Entity({ name: 'wars' })
export class WarsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() // TODO uuid?
  guild_1: string;

  @Column() // TODO uuid?
  guild_2: string;

  // @Column() // TODO uuid?
  // requested_to: string;

  // @Column() // TODO uuid?
  // requested_by: string;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column()
  prize_points: number;

  @Column()
  war_time: Date;

  @Column()
  time_to_answer: number;

  @Column()
  max_unanswered: number;

  @Column()
  add_on: string;

  @CreateDateColumn()
  created_at: Date;

  @Column('boolean', { default: false })
  accepted: boolean;
}
