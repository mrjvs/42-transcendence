import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { GuildsEntity } from '@/guilds.entity';
import { WarsEntity } from '@/wars.entity';
import { IWars } from '@/wars.interface';
import { GuildsService } from '../guilds/guilds.service';

@Injectable()
export class WarsService {
  constructor(
    @InjectRepository(WarsEntity)
    private warsRepository: Repository<WarsEntity>,
    private guildsService: GuildsService,
  ) {}

  getAllWars(): Promise<WarsEntity[]> {
    return this.warsRepository.find();
  }

  async sendWarRequest(guildId: string, request: IWars) {
    //   return this.warsRepository
    //   .createQueryBuilder()
    //   .insert()
    //   .values({

    //   })
    // }
    // console.log(request);
    // console.log(request.start_date);
    // console.log(new Date(request.start_date).toISOString());

    // var found: WarsEntity[] = await this.warsRepository
    //   .createQueryBuilder()
    //   .select()
    //   .where('accepted = :a', { a: true })
    //   .andWhere(
    //     new Brackets((qb) => {
    //       qb.where(
    //         'guild_1 = :g1 OR guild_2 = :g1 OR guild_1 = :g2 OR guild_2 = :g2',
    //         {
    //           g1: request.guild_1,
    //           g2: request.guild_2,
    //         },
    //       ).andWhere(
    //         new Brackets((qb) => {
    //           qb.where('"end_date" BETWEEN :s AND :e', {
    //             s: new Date(request.start_date).toISOString(),
    //             e: new Date(request.end_date).toISOString(),
    //           });
    //           // .orWhere('"start_date" BETWEEN :s AND :e', {
    //           //   s: new Date(request.start_date).toISOString(),
    //           //   e: new Date(request.end_date).toISOString(),
    //           // })
    //           // .orWhere('"start_date" < :s AND "end_date" > :e', {
    //           //   s: new Date(request.start_date).toISOString(),
    //           //   e: new Date(request.end_date).toISOString(),
    //           // });
    //         }),
    //       );
    //     }),
    //   )

    //   .andWhere('accepted = :a', { a: true })
    //   .andWhere(
    //     'guild_1 = :g1 OR guild_2 = :g1 OR guild_1 = :g2 OR guild_2 = :g2',
    //     {
    //       g1: request.guild_1,
    //       g2: request.guild_2,
    //     },
    //   )
    //   .andWhere(
    //     new Brackets((qb) => {
    //       qb.where('"end_date" BETWEEN :s AND :e', {
    //         s: request.start_date,
    //         e: request.end_date,
    //       })
    //         .orWhere('"start_date" BETWEEN :s AND :e', {
    //           s: request.start_date,
    //           e: request.end_date,
    //         })
    //         .orWhere('"start_date" < :s AND "end_date" > :e', {
    //           s: request.start_date,
    //           e: request.end_date,
    //         });
    //     }),
    //   )
    //   .execute();

    // console.log(found);

    // if (found.length !== 0) throw new BadRequestException();
    return this.warsRepository.save(request);
  }

  async acceptWarRequest(warId: string) {
    return this.warsRepository
      .createQueryBuilder()
      .update()
      .set({ accepted: true })
      .where({ id: warId })
      .execute();
  }

  async declineWarRequest(warId: string) {
    return this.warsRepository
      .createQueryBuilder()
      .delete()
      .where({ id: warId })
      .execute();
  }

  async endOfWar(warId: string) {
    let war = await this.warsRepository
      .findOne({
        where: {
          id: warId,
        },
      })
      .catch((error) => {
        if (error.code === '23505') throw new NotFoundException();
        throw error;
      });
    if (war.points_guild_1 > war.points_guild_2) {
      this.guildsService.guildWin(war.guild_1, war.prize_points);
      this.guildsService.guildLose(war.guild_2);
    } else if (war.points_guild_2 > war.points_guild_1) {
      this.guildsService.guildWin(war.guild_2, war.prize_points);
      this.guildsService.guildLose(war.guild_1);
    } else {
      this.guildsService.guildTie(war.guild_1, war.prize_points / 2);
      this.guildsService.guildTie(war.guild_2, war.prize_points / 2);
    }
    return;
  }
}
