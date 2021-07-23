import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  IsBoolean,
  IsDate,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ILadderUser, LadderUserEntity } from '@/ladder_user.entity';

@Check(`"end_date" > "start_date"`)
@Check(`"start_date" > "created_at"`)
@Entity('ladder')
export class LadderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  is_ranked: boolean;

  @Column({ type: 'json' })
  rank: IRank[];

  @Column()
  @OneToMany(() => LadderUserEntity, (user) => user.id)
  users: LadderUserEntity[];

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  end_date: Date;
}

export interface ILadder {
  id: string;
  rank: IRank[];
  users: ILadderUser[];
  is_ranked?: boolean;
  start_date?: Date;
  end_date?: Date;
}

export class LadderDto {
  @IsNotEmpty()
  @IsJSON()
  rank: IRank[];

  @IsNotEmpty()
  @IsBoolean()
  @IsOptional()
  is_ranked: boolean;

  @IsNotEmpty()
  @IsDate()
  @IsOptional()
  start_date: Date;

  @IsNotEmpty()
  @IsDate()
  @IsOptional()
  end_date: Date;
}

export interface IRank {
  name: ERank;
  topLimit: number;
  bottomLimit: number;
}

export enum ERank {
  BRONZE,
  SILVER,
  GOLD,
  DIAMOND,
  MASTER,
}

export class LadderPaginationDto {
  @IsOptional()
  @IsNumber()
  topLimit: number;

  @IsOptional()
  @IsNumber()
  bottomLimit: number;
}
