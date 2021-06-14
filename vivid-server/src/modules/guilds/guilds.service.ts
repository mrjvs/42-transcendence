import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GuildsEntity } from '@/guilds.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserEntity } from '@/user.entity';
import { IGuild } from '~/models/guild.interface';

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
      .execute()
      .catch((error) => {
        if (error.code === '23505') throw new BadRequestException();
        throw error;
      });
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
    console.log('winner: ', guildAnagram, points);
    return this.guildsRepository
      .createQueryBuilder()
      .update()
      .set({
        wars_won: () => 'wars_won + 1',
        total_points: () => `total_points + ${points}`,
      })
      .where('anagram = :anagram', { anagram: guildAnagram })
      .execute()
      .catch((error) => {
        if (error.code === '23505') throw new BadRequestException();
        throw error;
      });
  }

  async guildTie(guildAnagram: string, points: number): Promise<UpdateResult> {
    return this.guildsRepository
      .createQueryBuilder()
      .update()
      .set({
        wars_tied: () => 'wars_tied + 1',
        total_points: () => `total_points + ${points}`,
      })
      .where('anagram = :anagram', { anagram: guildAnagram })
      .execute()
      .catch((error) => {
        if (error.code === '23505') throw new BadRequestException();
        throw error;
      });
  }

  async guildLose(guildAnagram: string): Promise<UpdateResult> {
    console.log('loser: ', guildAnagram);
    return this.guildsRepository
      .createQueryBuilder()
      .update()
      .set({ wars_lost: () => 'wars_lost + 1' })
      .where('anagram = :anagram', { anagram: guildAnagram })
      .execute()
      .catch((error) => {
        if (error.code === '23505') throw new NotFoundException();
        throw error;
      });
  }

  async findGuildAnagram(guildAnagram: string): Promise<GuildsEntity> {
    return this.guildsRepository
      .findOne({ anagram: guildAnagram })
      .catch((error) => {
        if (error.code === '22P02') throw new NotFoundException();
        throw error;
      });
  }

  async rankGuilds(): Promise<GuildsEntity[]> {
    return this.guildsRepository
      .createQueryBuilder()
      .select()
      .where({ active: true })
      .orderBy({ total_points: 'DESC', wars_won: 'DESC' })
      .execute();
  }

  async changeWarId(
    guildAnagram: string,
    warId: string,
  ): Promise<UpdateResult> {
    return await this.guildsRepository
      .createQueryBuilder()
      .update()
      .set({ current_war_id: warId })
      .where({ anagram: guildAnagram })
      .execute()
      .catch((error) => {
        if (error.code === '22P02') throw new NotFoundException();
        throw error;
      });
  }

  async deactivateGuild(guildAnagram: string): Promise<UpdateResult> {
    return await this.guildsRepository
      .createQueryBuilder()
      .update()
      .set({ active: false })
      .where({ anagram: guildAnagram })
      .execute()
      .catch((error) => {
        if (error.code === '22P02') throw new NotFoundException();
        throw error;
      });
  }
}
