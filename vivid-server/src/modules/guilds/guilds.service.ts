import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GuildsEntity } from '@/guilds.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class GuildsService {
  constructor(
    @InjectRepository(GuildsEntity)
    private guildsRepository: Repository<GuildsEntity>,
  ) {}

  async createGuild(userId: string, nameGuild: string) {
    return this.guildsRepository
      .createQueryBuilder()
      .insert()
      .values({
        name: nameGuild,
        owner: userId,
      })
      .execute()
      .catch((error) => {
        if (error.code === '23505') throw new BadRequestException();
        throw error;
      });
  }

  async getAll() {
    return this.guildsRepository.createQueryBuilder().select().execute();
  }

  async changeGuildAnagram(userId: string, guildAnagram: string) {
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

  async changeGuildName(userId: string, guildName: string) {
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

  async guildWin(guildAnagram: string, points: number) {
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

  async guildLose(guildAnagram: string) {
    return this.guildsRepository
      .createQueryBuilder()
      .update()
      .set({ wars_won: () => 'wars_lost + 1' })
      .where('anagram = :anagram', { anagram: guildAnagram })
      .execute()
      .catch((error) => {
        if (error.code === '23505') throw new NotFoundException();
        throw error;
      });
  }

  async findGuildAnagram(guildAnagram: string) {
    return this.guildsRepository
      .findOne({
        where: {
          anagram: guildAnagram,
        },
      })
      .catch((error) => {
        if (error.code === '22P02') throw new NotFoundException();
        throw error;
      });
  }

  async rankGuilds() {
    return this.guildsRepository
      .createQueryBuilder()
      .select()
      .where({active: true })
      .orderBy({ total_points: 'DESC', wars_won: 'DESC' })
      .execute();
  }

  async changeWarId(guildAnagram: string, warId: string): Promise<UpdateResult> {
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

  async deactivateGuild(guildAnagram: string): Promise<DeleteResult> {
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
