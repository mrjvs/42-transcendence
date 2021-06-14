import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { WarEntity } from '@/war.entity';
import { IWar } from '@/war.interface';
import { WarTimeEntity } from '@/war_time.entity';

@Injectable()
export class WarsService {
  constructor(
    @InjectRepository(WarEntity)
    private warsRepository: Repository<WarEntity>,
    @InjectRepository(WarTimeEntity)
    private warTimeRepository: Repository<WarTimeEntity>,
  ) {}

  getAllWars(): Promise<WarEntity[]> {
    return this.warsRepository.find();
  }

  async sendWarRequest(request: IWar) {
    // TODO check if Guild exist -> need merge with Guilds to be able to do this

    // Create war
    const war = this.warsRepository.create(request);

    // Create and save War Time timetable and link it to the war
    war.war_time = await this.warTimeRepository
      .save(request.war_time)
      .catch((error) => {
        if (error.code === '23514' || error.code === '23502')
          throw new BadRequestException();
        throw error;
      });

    // Save war
    return war.save().catch((error) => {
      if (error.code === '23514') throw new BadRequestException();
      throw error;
    });
  }

  async acceptWarRequest(warId: string) {
    // Get war
    const [war] = await WarEntity.find({ id: warId });

    // Check for overlapping wars
    const overlappingWar = await this.warsRepository
      .createQueryBuilder()
      .select()
      .where('accepted = :a', { a: true })
      .andWhere('start_date <= :e', { e: war.end_date })
      .andWhere('end_date >= :s', { s: war.start_date })
      .andWhere(
        new Brackets((qb) => {
          qb.where('requesting_guild = :g1', { g1: war.requesting_guild })
            .orWhere('accepting_guild = :g2', { g2: war.requesting_guild })
            .orWhere('requesting_guild = :g3', { g3: war.accepting_guild })
            .orWhere('accepting_guild = :g4', { g4: war.accepting_guild });
        }),
      )
      .execute();

    // Bad Request if overlapping war was found
    if (overlappingWar.length !== 0) throw new BadRequestException();

    // Save war with overlapping war check to avoid race condition
    return await this.warsRepository
      .createQueryBuilder()
      .update()
      .set({
        accepted: true,
      })
      .where({ id: warId })
      .andWhere(() => {
        return (
          'NOT EXISTS ( ' +
          this.warsRepository
            .createQueryBuilder()
            .select()
            .where(`accepted = ${true}`)
            .andWhere(`start_date <= '${war.end_date.toISOString()}'`)
            .andWhere(`end_date >= '${war.start_date.toISOString()}'`)
            .andWhere(
              new Brackets((qb) => {
                qb.where(`requesting_guild = '${war.requesting_guild}'`)
                  .orWhere(`accepting_guild = '${war.requesting_guild}'`)
                  .orWhere(`requesting_guild = '${war.accepting_guild}'`)
                  .orWhere(`accepting_guild = '${war.accepting_guild}'`);
              }),
            )
            .getQuery() +
          ' )'
        );
      })
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
    //   let war = await this.warRepository
    //     .findOne({
    //       where: {
    //         id: warId,
    //       },
    //     })
    //     .catch((error) => {
    //       if (error.code === '23505') throw new NotFoundException();
    //       throw error;
    //     });
    //   if (war.points_guild_1 > war.points_guild_2) {
    //     this.guildsService.guildWin(war.guild_1, war.prize_points);
    //     this.guildsService.guildLose(war.guild_2);
    //   } else if (war.points_guild_2 > war.points_guild_1) {
    //     this.guildsService.guildWin(war.guild_2, war.prize_points);
    //     this.guildsService.guildLose(war.guild_1);
    //   } else {
    //     this.guildsService.guildTie(war.guild_1, war.prize_points / 2);
    //     this.guildsService.guildTie(war.guild_2, war.prize_points / 2);
    //   }
    //   return;
  }
}
