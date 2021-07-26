import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Connection } from 'typeorm';

import {
  ERank,
  ILadder,
  LadderDto,
  LadderEntity,
  LadderPaginationDto,
  RankMap,
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
        details: {
          title: 'Casual match',
          description: 'Just a normal match with random people',
          color: 'blue',
          icon: 'gamepad',
        },
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
        details: {
          title: 'Competitive match',
          description: 'Fight to the best of your ability against your foes',
          color: 'yellow',
          icon: 'bolt',
        },
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
        ].map((v) => ({
          ...v,
          ...RankMap[v.name],
        })),
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

  // list one user
  getUser(ladderId: string, userId: string): Promise<ILadderUser> {
    return this.ladderUserRepository.findOne({
      where: {
        ladder: ladderId,
        user: userId,
      },
    });
  }

  getUserLadders(userId: string): Promise<LadderUserEntity[]> {
    return this.ladderUserRepository.find({
      where: {
        user: userId,
      },
    });
  }

  private static calculateProbability(
    rating1: number,
    rating2: number,
  ): number {
    const p = 1.0 / (1.0 + Math.pow(10, (rating2 - rating1) / 400));
    if (p < 0.001) return 0.01;
    if (p >= 1) return 0.99;
    return p;
  }

  // adjust rating
  async adjustRating(
    user1: string,
    user2: string,
    ladderId: string,
    winner: string,
  ): Promise<ILadderUser[]> {
    const u1 = await this.ladderUserRepository.findOne({
      where: { ladder: ladderId, user: user1 },
    });
    const u2 = await this.ladderUserRepository.findOne({
      where: { ladder: ladderId, user: user2 },
    });

    const P1 = LadderService.calculateProbability(u1.points, u2.points);
    const P2 = LadderService.calculateProbability(u2.points, u1.points);
    const K = 100;

    let user1_points;
    let user2_points;
    if (user1 === winner) {
      user1_points = Math.ceil(u1.points + K * (1 - P1));
      user2_points = Math.ceil(u2.points + K * (0 - P2));
    } else {
      user1_points = Math.ceil(u1.points + K * (0 - P1));
      user2_points = Math.ceil(u2.points + K * (1 - P2));
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
          points: user1_points,
        })
        .where({ id: u1.id })
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
          points: user2_points,
        })
        .where({ id: u2.id })
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
