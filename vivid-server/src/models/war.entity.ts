import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
  Check,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { GuildsEntity } from './guilds.entity';
import { MatchesEntity } from './matches.entity';
import { WarTimeEntity } from './war_time.entity';

@Check(`"end_date" > "start_date"`)
@Check(`"start_date" > "created_at"`)
@Entity({ name: 'wars' })
export class WarEntity extends BaseEntity {
  @OneToMany(() => MatchesEntity, (match) => match.war_id)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => GuildsEntity, (guild) => guild.anagram)
  @JoinColumn({ name: 'requesting_guild' })
  requesting_guild: GuildsEntity;

  @ManyToOne(() => GuildsEntity, (guild) => guild.anagram)
  @JoinColumn({ name: 'accepting_guild' })
  accepting_guild: GuildsEntity;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ nullable: false })
  prize_points: number;

  @Column({ nullable: false })
  time_to_answer: number;

  @Column()
  max_unanswered: number;

  @Column()
  add_on: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: 0 })
  points_requesting: number;

  @Column({ default: 0 })
  points_accepting: number;

  @Column('boolean', { default: false })
  accepted: boolean;

  @OneToMany(() => WarTimeEntity, (warTime) => warTime.war)
  war_time: WarTimeEntity[];

  @OneToMany(() => GuildsEntity, (guild) => guild.current_war)
  guilds: GuildsEntity[];
}
