import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { WarEntity } from '@/war.entity';
import { GuildsEntity } from '@/guilds.entity';
import { IWar } from '@/war.interface';
import { WarTimeEntity } from '@/war_time.entity';
import { GuildsService } from '$/guilds/guilds.service';

@Injectable()
export class WarsService {
  constructor(
    @InjectRepository(WarEntity)
    private warsRepository: Repository<WarEntity>,
    @InjectRepository(WarTimeEntity)
    private warTimeRepository: Repository<WarTimeEntity>,
    private guildsService: GuildsService,
  ) {}

  getAllWars(): Promise<WarEntity[]> {
    return this.warsRepository.find();
  }

  private async findWar(warId: string): Promise<WarEntity> {
    const war = await this.warsRepository.findOne({
      relations: ['guilds', 'requesting_guild', 'accepting_guild'],
      where: { id: warId },
    });
    return war;
  }

  // Check if all War Times are within the timeframe of the war
  // deze loopt niet UTC
  private validWartimes(war: IWar): boolean {
    for (const block of war.war_time) {
      if (block.start_date < war.start_date || block.end_date > war.end_date)
        return false;
    }
    return true;
  }

  async sendWarRequest(warRequest: IWar): Promise<WarEntity> {
    // check if guilds exist
    const acceptingGuild = await this.guildsService.findGuild(
      warRequest.accepting,
    );
    const requestingGuild = await this.guildsService.findGuild(
      warRequest.requesting,
    );
    if (!acceptingGuild || !requestingGuild) throw new NotFoundException();

    // Check if wartimes are valid
    if (!this.validWartimes(warRequest)) throw new BadRequestException();

    // Create War Time array and save it in database
    const war_time: WarTimeEntity[] = await this.warTimeRepository
      .save(warRequest.war_time)
      .catch((error) => {
        if (error.code === '23514' || error.code === '23502')
          throw new BadRequestException();
        throw error;
      });

    // Create war
    const war: WarEntity = this.warsRepository.create(warRequest);

    // Link war with guilds and War Time
    war.accepting_guild = acceptingGuild;
    war.requesting_guild = requestingGuild;
    war.war_time = war_time;

    // Save war in database
    return war.save().catch((error) => {
      if (error.code === '23514') throw new BadRequestException();
      throw error;
    });
  }

  private async overlappingWar(war: WarEntity): Promise<boolean> {
    const overlappingWar = await this.warsRepository
      .createQueryBuilder()
      .select()
      .where('accepted = :a', { a: true })
      .andWhere('start_date <= :e', { e: war.end_date })
      .andWhere('end_date >= :s', { s: war.start_date })
      .andWhere(
        new Brackets((qb) => {
          qb.where('requesting_guild = :g1', {
            g1: war.requesting_guild.id,
          })
            .orWhere('accepting_guild = :g2', {
              g2: war.requesting_guild.id,
            })
            .orWhere('requesting_guild = :g3', {
              g3: war.accepting_guild.id,
            })
            .orWhere('accepting_guild = :g4', {
              g4: war.accepting_guild.id,
            });
        }),
      )
      .execute();
    if (overlappingWar.length !== 0) return true;
    return false;
  }

  async acceptWarRequest(warId: string): Promise<UpdateResult> {
    // Find war
    const war = await this.findWar(warId);
    if (!war) throw new NotFoundException();

    // Check for overlapping accepted wars
    if (await this.overlappingWar(war)) throw new BadRequestException();

    // Save war with extra overlap check to avoid race condition
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
                qb.where(`requesting_guild = '${war.requesting_guild.id}'`)
                  .orWhere(`accepting_guild = '${war.requesting_guild.id}'`)
                  .orWhere(`requesting_guild = '${war.accepting_guild.id}'`)
                  .orWhere(`accepting_guild = '${war.accepting_guild.id}'`);
              }),
            )
            .getQuery() +
          ' )'
        );
      })
      .execute();
  }

  async declineWarRequest(warId: string): Promise<DeleteResult> {
    return this.warsRepository
      .createQueryBuilder()
      .delete()
      .where({ id: warId })
      .execute();
  }

  async startWar(warId: string): Promise<UpdateResult> {
    const war = await this.findWar(warId);
    if (!war) throw new NotFoundException();

    return this.guildsService.startWar(war);
  }

  async checkWars(now: string): Promise<UpdateResult> {
    // const war = await this.findWar(warId);
    // if (!war) throw new NotFoundException();
    // return this.guildsService.startWar(war);

    return await this.warsRepository
      .createQueryBuilder()
      .select()
      .where(`accepted = ${true}`)
      .andWhere(`start_date <= '${now}'`)
      .andWhere(`end_date >= '${now}'`)
      .execute();
  }

  async endWar(warId: string): Promise<GuildsEntity[]> {
    // Find war
    const war = await this.findWar(warId);
    if (!war) throw new NotFoundException();

    // TODO Do we need to check if the war has already been ended?

    // If the war was a tie
    if (war.points_accepting == war.points_requesting)
      this.guildsService.guildTie(war.guilds, war.prize_points / 2);
    else {
      // Set winner & loser
      let winner: string, loser: string;
      if (war.points_requesting > war.points_accepting) {
        winner = war.requesting_guild.anagram;
        loser = war.accepting_guild.anagram;
      } else {
        winner = war.accepting_guild.anagram;
        loser = war.requesting_guild.anagram;
      }

      // Resolve points
      this.guildsService.guildWin(winner, war.prize_points);
      this.guildsService.guildLose(loser);
    }
    // TODO unupdated guilds are returned, what do we want to return?

    await this.warsRepository
      .createQueryBuilder()
      .update()
      .set({ accepted: false })
      .where({ id: warId })
      .execute();

    return war.guilds;
  }

  async updateWarWinReq(warId: string) {
    await this.warsRepository
      .createQueryBuilder()
      .update()
      .set({
        points_requesting: () => 'points_requesting + 1',
      })
      .where({ id: warId })
      .execute();
  }

  async updateWarWinAccept(warId: string) {
    await this.warsRepository
      .createQueryBuilder()
      .update()
      .set({
        points_accepting: () => 'points_accepting + 1',
      })
      .where({ id: warId })
      .execute();
  }
}
