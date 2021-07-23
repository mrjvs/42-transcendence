import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
  ERank,
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

  async generateDefaults(): Promise<void> {
    const logger: Logger = new Logger(LadderService.name);
    try {
      await this.ladderRepository.insert({
        type: 'casual',
        special_id: 'casual',
        ranks: [],
      });
    } catch (err) {
      if (err.code !== '23505') {
        logger.error('Failed to create default ladder');
        throw err;
      }
    }

    try {
      await this.ladderRepository.insert({
        type: 'ranked',
        special_id: 'ranked',
        ranks: [
          {
            name: ERank.BRONZE,
            topLimit: 400,
            bottomLimit: 0,
          },
          {
            name: ERank.SILVER,
            topLimit: 800,
            bottomLimit: 400,
          },
          {
            name: ERank.GOLD,
            topLimit: 1600,
            bottomLimit: 800,
          },
          {
            name: ERank.DIAMOND,
            topLimit: 2400,
            bottomLimit: 1600,
          },
          {
            name: ERank.MASTER,
            topLimit: -1,
            bottomLimit: 2400,
          },
        ],
      });
    } catch (err) {
      if (err.code !== '23505') {
        logger.error('Failed to create default ladder');
        throw err;
      }
    }

    logger.log('Successfully created default ladders');
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

  async listLadders(): Promise<ILadder[]> {
    return this.ladderRepository.find();
  }

  // list all users
  async listLadder(
    ladderId: string,
    ladderPagination?: LadderPaginationDto,
  ): Promise<ILadderUser[]> {
    if (!ladderPagination) {
      return await this.ladderUserRepository.find({
        where: { ladder: ladderId },
        order: { points: 'DESC' },
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
      order: { points: 'DESC' },
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
        order: { points: 'DESC' },
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
      order: { points: 'DESC' },
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
