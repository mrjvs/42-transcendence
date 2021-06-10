import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';
import { GuildRequestEntity } from '@/guild_request.entity';

@Injectable()
export class GuildRequestService {
  constructor(
    @InjectRepository(GuildRequestEntity)
    private guildRequestRepository: Repository<GuildRequestEntity>,
  ) {}

  findAll(): Promise<GuildRequestEntity[]> {
    return this.guildRequestRepository.find();
  }

  async findAllGuildRequests(userId: string): Promise<GuildRequestEntity[]> {
    console.log(userId);
    return await this.guildRequestRepository
      .createQueryBuilder()
      .select()
      .where({ user: userId })
      .andWhere('accepted = :accepted', { accepted: false })
      .execute()
      .catch((error) => {
        if (error.code === '22P02') throw new NotFoundException();
        throw error;
      });
  }

  async sendGuildRequest(
    _user: string,
    _invited_by: string,
    _guild_anagram: string,
  ): Promise<InsertResult> {
    return this.guildRequestRepository
      .createQueryBuilder()
      .insert()
      .values({
        user: _user,
        invited_by: _invited_by,
        guild_anagram: _guild_anagram,
      })
      .execute()
      .catch((error) => {
        if (error.code === '23505') throw new BadRequestException();
        throw error;
      });
  }

  async acceptGuildRequest(
    userId: string,
    guildRequestId: string,
  ): Promise<UpdateResult> {
    return await this.guildRequestRepository
      .createQueryBuilder()
      .update()
      .set({ accepted: true })
      .where('id = :id', { id: guildRequestId })
      .andWhere('user = :u', { u: userId })
      .execute()
      .catch((error) => {
        if (error.code === '22P02') throw new NotFoundException();
        throw error;
      });
  }

  async deleteGuildRequest(
    userId: string,
    guildRequestId: string,
  ): Promise<DeleteResult> {
    return await this.guildRequestRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id: guildRequestId })
      .andWhere('user = :u1', { u1: userId })
      .execute()
      .catch((error) => {
        if (error.code === '22P02') throw new NotFoundException();
        throw error;
      });
  }

  async findone(guildRequestId: string): Promise<GuildRequestEntity> {
    return this.guildRequestRepository.findOne(guildRequestId);
  }
}
