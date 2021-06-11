import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
  Check,
  OneToMany,
} from 'typeorm';
import { WarTimeEntity } from './war_time.entity';

@Check(`"end_date" > "start_date"`)
@Check(`"start_date" > "created_at"`)
@Entity({ name: 'wars' })
export class WarEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requesting_guild: string;

  @Column()
  accepting_guild: string;

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

  @Column('boolean', { default: false })
  accepted: boolean;

  @OneToMany(() => WarTimeEntity, (warTime) => warTime.war)
  war_time: WarTimeEntity[];
}
