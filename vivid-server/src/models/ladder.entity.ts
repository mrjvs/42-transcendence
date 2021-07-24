import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import {
  IsDate,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ILadderUser, LadderUserEntity } from '@/ladder_user.entity';

@Check(`"end_date" > "start_date"`)
@Check(`"start_date" > "created_at"`)
@Unique(['special_id'])
@Entity('ladder')
export class LadderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: null, nullable: true })
  special_id: string | null;

  // "casual" or "ranked"
  @Column()
  type: string;

  @Column({ type: 'json' })
  ranks: IRank[];

  @Column({ type: 'json' })
  details: ILadderDetails;

  @OneToMany(() => LadderUserEntity, (user) => user.ladder)
  users: LadderUserEntity[];

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  end_date: Date;
}

export interface IRank {
  name: ERank;
  topLimit: number;
  bottomLimit: number;
  displayName: string;
  color: string;
}

export interface ILadderDetails {
  title: string;
  description: string;
  color: string;
  icon: string;
}

export interface ILadder {
  id: string;
  ranks: IRank[];
  users: ILadderUser[];
  type: string;
  start_date?: Date;
  end_date?: Date;
}

export class LadderDto {
  @IsNotEmpty()
  @IsJSON()
  ranks: IRank[];

  @IsNotEmpty()
  @IsOptional()
  type: string;

  @IsNotEmpty()
  @IsDate()
  @IsOptional()
  start_date: Date;

  @IsNotEmpty()
  @IsDate()
  @IsOptional()
  end_date: Date;
}

export enum ERank {
  BRONZE = 0,
  SILVER = 1,
  GOLD = 2,
  DIAMOND = 3,
  MASTER = 4,
}

export const RankMap = {
  0: {
    displayName: 'Bronze',
    color: 'bronze',
  },
  1: {
    displayName: 'Silver',
    color: 'silver',
  },
  2: {
    displayName: 'Gold',
    color: 'yellow',
  },
  3: {
    displayName: 'Diamond',
    color: 'blue',
  },
  4: {
    displayName: 'Master',
    color: 'sparkles',
  },
};

export class LadderPaginationDto {
  @IsOptional()
  @IsNumber()
  topLimit: number;

  @IsOptional()
  @IsNumber()
  bottomLimit: number;
}
