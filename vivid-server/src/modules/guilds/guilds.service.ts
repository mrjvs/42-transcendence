import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GuildsEntity } from '@/guilds.entity';
import { Brackets, DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserEntity } from '@/user.entity';
import { IGuild } from '@/guild.interface';
import { WarEntity } from '@/war.entity';

@Injectable()
export class GuildsService {
  constructor(
    @InjectRepository(GuildsEntity)
    private guildsRepository: Repository<GuildsEntity>,
  ) {}

  async createGuild(user: UserEntity, guild: IGuild): Promise<UpdateResult> {
    return this.guildsRepository
      .createQueryBuilder()
      .insert()
      .values({
        name: guild.name,
        anagram: guild.anagram,
        owner: user,
      })
      .execute();
  }

  async getAll(): Promise<GuildsEntity[]> {
    return this.guildsRepository.createQueryBuilder().select().execute();
  }

  async changeGuildAnagram(
    userId: string,
    guildAnagram: string,
  ): Promise<UpdateResult> {
    return this.guildsRepository
      .createQueryBuilder()
      .update()
      .set({
        anagram: guildAnagram,
      })
      .where('owner = :owner', { owner: userId })
      .execute()
      .catch((error) => {
        if (error.code === '23505') throw new BadRequestException();
        throw error;
      });
  }

  async changeGuildName(
    userId: string,
    guildName: string,
  ): Promise<UpdateResult> {
    return this.guildsRepository
      .createQueryBuilder()
      .update()
      .set({
        name: guildName,
      })
      .where('owner = :owner', { owner: userId })
      .execute()
      .catch((error) => {
        if (error.code === '23505') throw new BadRequestException();
        throw error;
      });
  }

  async guildWin(guildAnagram: string, points: number): Promise<UpdateResult> {
    return this.guildsRepository
      .createQueryBuilder()
      .update()
      .set({
        wars_won: () => 'wars_won + 1',
        total_points: () => `total_points + ${points}`,
        current_war: null,
      })
      .where('anagram = :anagram', { anagram: guildAnagram })
      .execute();
  }

  async guildTie(
    guilds: GuildsEntity[],
    points: number,
  ): Promise<UpdateResult> {
    return this.guildsRepository
      .createQueryBuilder()
      .update()
      .set({
        wars_tied: () => 'wars_tied + 1',
        total_points: () => `total_points + ${points}`,
        current_war: null,
      })
      .where('anagram = :a1', { a1: guilds[0].anagram })
      .orWhere('anagram = :a2', { a2: guilds[1].anagram })
      .execute();
  }

  async guildLose(guildAnagram: string): Promise<UpdateResult> {
    return this.guildsRepository
      .createQueryBuilder()
      .update()
      .set({ wars_lost: () => 'wars_lost + 1', current_war: null })
      .where('anagram = :anagram', { anagram: guildAnagram })
      .execute();
  }

  async findGuild(guildAnagram: string): Promise<GuildsEntity> {
    const guild = await this.guildsRepository.findOne({
      relations: ['owner'],
      where: { anagram: guildAnagram },
    });
    return guild;
  }

  async guildsRankList(): Promise<GuildsEntity[]> {
    return this.guildsRepository
      .createQueryBuilder()
      .select()
      .where({ active: true })
      .orderBy({ total_points: 'DESC', wars_won: 'DESC' })
      .execute();
  }

  async deleteGuild(guildAnagram: string): Promise<DeleteResult> {
    return this.guildsRepository
      .createQueryBuilder()
      .delete()
      .where({ anagram: guildAnagram })
      .execute()
      .catch((error) => {
        if (error.code === '22P02') throw new NotFoundException();
        throw error;
      });
  }

  async startWar(war: WarEntity): Promise<UpdateResult> {
    return this.guildsRepository
      .createQueryBuilder()
      .update()
      .set({ current_war: war })
      .where(
        new Brackets((qb) => {
          qb.where('anagram = :a1', {
            a1: war.requesting_guild.anagram,
          }).orWhere('anagram = :a2', {
            a2: war.accepting_guild.anagram,
          });
        }),
      )
      .execute();
  }
}
