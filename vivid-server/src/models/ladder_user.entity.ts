import {
  AfterLoad,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '@/user.entity';
import { IUser } from '@/user.interface';
import { ERank, LadderEntity } from '@/ladder.entity';

@Entity('ladder_user')
export class LadderUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @ManyToOne(() => UserEntity, (user) => user.ranks)
  user: string;

  @Column()
  @ManyToOne(() => LadderEntity, (ladder) => ladder.users)
  ladder: string;

  @Column()
  points: number;

  rank: ERank;

  @AfterLoad()
  getRank() {
    if (this.ladder.constructor === String) return;
    const ladderObj = this.ladder as unknown as LadderEntity;
    ladderObj.rank.forEach((rank) =>
      this.points > rank.topLimit ? (this.rank = rank.name) : null,
    );
    if (this.rank === null) this.rank = ladderObj.rank[0].name;
  }

  @Column()
  wins: number;

  @Column()
  losses: number;

  @Column()
  in_queue: boolean;

  @Column({ type: 'timestamp', nullable: true, default: null })
  queue_time: Date;
}

export class ILadderUser {
  id: string;
  user: string | IUser;
  points: number;
  rank: ERank;
  wins: number;
  losses: number;
  in_queue: boolean;
  queue_time: Date;
}
