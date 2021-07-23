import {
  AfterLoad,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IUser, UserEntity } from '@/user.entity';
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
    if (ladderObj.type === 'ranked') {
      const rank = ladderObj.ranks.find(
        (rank) =>
          this.points > rank.bottomLimit &&
          (this.points <= rank.topLimit || rank.topLimit == -1),
      );
      this.rank = rank?.name;
    } else this.rank = 0;
  }
}

export class ILadderUser {
  id: string;
  user: string | IUser;
  points: number;
  rank: ERank;
}
