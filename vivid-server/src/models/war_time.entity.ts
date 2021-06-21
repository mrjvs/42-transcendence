import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  Check,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WarEntity } from './war.entity';

@Check(`"end_date" > "start_date"`)
@Check(`"start_date" > "created_at"`)
@Entity({ name: 'war_time' })
export class WarTimeEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  war_time_id: string;

  @Column({ nullable: false, type: 'timestamp' })
  start_date: Date;

  @Column({ nullable: false, type: 'timestamp' })
  end_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => WarEntity, (war) => war.war_time)
  @JoinColumn({ name: 'war_id' })
  war: WarEntity;
}
