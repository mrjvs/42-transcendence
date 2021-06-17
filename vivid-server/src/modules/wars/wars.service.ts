import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const war = await this.warsRepository
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
