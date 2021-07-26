import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IUser, UserEntity } from '@/user.entity';
import { LadderEntity } from '@/ladder.entity';

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

  getRank() {
    if (this.ladder.constructor === String) return null;
    const ladderObj = this.ladder as unknown as LadderEntity;
    if (ladderObj.type === 'ranked') {
      const rank = ladderObj.ranks.find(
        (rank) =>
          (this.points > rank.bottomLimit || rank.bottomLimit == 0) &&
          (this.points <= rank.topLimit || rank.topLimit == -1),
      );
      return rank;
    } else if (ladderObj.type === 'casual')
      return {
        name: 0,
        invalidRank: true,
      };
    return null;
  }
}

export class ILadderUser {
  id: string;
  user: string | IUser;
  points: number;
}
