import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
  Between,
  Connection,
} from 'typeorm';

import {
  ILadder,
  LadderDto,
  LadderEntity,
  LadderPaginationDto,
} from '@/ladder.entity';
import { ILadderUser, LadderUserEntity } from '@/ladder_user.entity';

@Injectable()
export class LadderService {
  constructor(
    @InjectRepository(LadderEntity)
    private ladderRepository: Repository<LadderEntity>,
    @InjectRepository(LadderUserEntity)
    private ladderUserRepository: Repository<LadderUserEntity>,
    private connection: Connection,
  ) {}

  async generate(ladderInput: LadderDto): Promise<ILadder> {
    return await this.ladderRepository.save(ladderInput);
  }

  async delete(ladderId: string): Promise<ILadder> {
    return await this.ladderRepository
      .createQueryBuilder()
      .delete()
      .where({ id: ladderId })
      .returning('*')
      .execute()
      .then((response) => {
        return <ILadder>response.raw[0];
      });
  }

  // list all users
  async listLadder(
    ladderId: string,
    ladderPagination?: LadderPaginationDto,
  ): Promise<ILadderUser[]> {
    if (!ladderPagination) {
      return await this.ladderUserRepository.find({
        where: { ladder: ladderId },
        order: { points: 'DESC', wins: 'DESC' },
      });
    }
    return await this.ladderUserRepository.find({
      where: {
        ladder: ladderId,
        points: Between(
          ladderPagination.topLimit,
          ladderPagination.bottomLimit,
        ),
      },
      order: { points: 'DESC', wins: 'DESC' },
    });
  }

  // list all users in specific rank
  async listRank(
    ladderId: string,
    rankId: string,
    ladderPagination?: LadderPaginationDto,
  ): Promise<ILadderUser[]> {
    if (!ladderPagination) {
      return await this.ladderUserRepository.find({
        where: { ladder: ladderId, rank: rankId },
        order: { points: 'DESC', wins: 'DESC' },
      });
    }
    return await this.ladderUserRepository.find({
      where: {
        ladder: ladderId,
        rank: rankId,
        points: Between(
          ladderPagination.topLimit,
          ladderPagination.bottomLimit,
        ),
      },
      order: { points: 'DESC', wins: 'DESC' },
    });
  }

  // list one user
  getUser(ladderId: string, userId: string): Promise<ILadderUser> {
    return this.ladderUserRepository.findOne({
      where: {
        ladder: ladderId,
        id: userId,
      },
    });
  }

  // TODO possible race condition
  // this will be called once before the matchmaking
  async startSearch(ladderId: string, userId: string): Promise<void> {
    const res = await this.ladderUserRepository
      .createQueryBuilder()
      .update()
      .set({ queue_time: new Date(), in_queue: true })
      .where({ id: userId })
      .execute();
    if (!res) throw new NotFoundException();
  }

  // opponent found so no more in queue
  async endSearch(ladderId: string, userId: string): Promise<void> {
    const res = await this.ladderUserRepository
      .createQueryBuilder()
      .update()
      .set({ queue_time: null, in_queue: false })
      .where({ ladder: ladderId, id: userId })
      .execute();
    if (!res) throw new NotFoundException();
  }

  // find opponent (excluding yourself)
  // this will be called many times
  async matchMake(ladderId: string, user: ILadderUser): Promise<ILadderUser> {
    if (user.in_queue === false) await this.startSearch(ladderId, user.id);

    const opponentParams: {
      id: any;
      ladder: string;
      rank: any;
      in_queue: boolean;
    } = {
      id: Not(user.id),
      ladder: ladderId,
      rank: user.rank - 1 || user.rank || user.rank + 1,
      in_queue: true,
    };

    const currentTime: Date = new Date();
    if (currentTime.getSeconds() >= user.queue_time.getSeconds() + 60) {
      opponentParams.rank =
        LessThanOrEqual(user.rank) || MoreThanOrEqual(user.rank);
    }
    const opponent = await this.ladderUserRepository.findOne(opponentParams);
    if (opponent) {
      await this.endSearch(ladderId, user.id);
      return opponent;
    }
    return undefined;
  }

  private static calculateProbability(
    rating1: number,
    rating2: number,
  ): number {
    return 1.0 / (1.0 + Math.pow(10, (rating2 - rating1) / 400));
  }

  // adjust rating
  // it will get the match id for info
  // for now it gets two user ids
  async adjustRating(
    ladder: ILadder,
    user1: ILadderUser,
    user2: ILadderUser,
    user1_won: boolean,
  ): Promise<ILadderUser[]> {
    const P1 = LadderService.calculateProbability(user1.points, user2.points);
    const P2 = LadderService.calculateProbability(user2.points, user1.points);
    const K = 100;

    let user1_points;
    let user2_points;
    if (user1_won) {
      user1_points = Math.ceil(user2.points + K * (1 - P1));
      user2_points = Math.ceil(user1.points + K * (0 - P2));
    } else {
      user1_points = Math.ceil(user2.points + K * (0 - P1));
      user2_points = Math.ceil(user1.points + K * (1 - P2));
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const result: ILadderUser[] = [];
    try {
      result[0] = await queryRunner.manager
        .getRepository(LadderUserEntity)
        .createQueryBuilder()
        .update()
        .set({
          points: () => `points = ${user1_points}`,
          wins: () => (user1_won ? 'wins + 1' : 'wins'),
          losses: () => (!user1_won ? 'losses + 1' : 'losses'),
        })
        .where({ ladder: ladder, id: user1.id })
        .returning('*')
        .execute()
        .then((response) => {
          return <ILadderUser>response.raw[0];
        });

      result[1] = await queryRunner.manager
        .getRepository(LadderUserEntity)
        .createQueryBuilder()
        .update()
        .set({
          points: () => `points = ${user2_points}`,
          wins: () => (!user1_won ? 'wins + 1' : 'wins'),
          losses: () => (user1_won ? 'losses + 1' : 'losses'),
        })
        .where({ ladder: ladder, id: user1.id })
        .returning('*')
        .execute()
        .then((response) => {
          return <ILadderUser>response.raw[0];
        });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return result;
  }
}
