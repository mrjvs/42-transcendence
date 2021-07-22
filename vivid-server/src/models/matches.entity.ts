import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'matches' })
export class MatchesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_req: string;

  @Column()
  user_acpt: string;

  @CreateDateColumn()
  game_ended: Date;

  @Column()
  user_req_score: number;

  @Column()
  user_acpt_score: number;

  @Column({ nullable: true, default: null })
  points_req: number;

  @Column({ nullable: true, default: null })
  points_acpt: number;

  @Column('varchar', { default: null })
  addons: string;

  @Column()
  game_type: string;

  @Column()
  winner_id: string;

  @Column({ nullable: true, default: null })
  war_id?: string;
}

export interface IMatch {
  id: string;
  user_req: string;
  user_acpt: string;
  game_ended: Date;
  user_req_score: number;
  user_acpt_score: number;
  addons: string;
  game_type: string;
  winner_id: string;
}
