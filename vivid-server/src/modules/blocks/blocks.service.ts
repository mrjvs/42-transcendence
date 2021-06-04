import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlocksEntity } from '@/blocks.entity';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(BlocksEntity)
    private blocksRepository: Repository<BlocksEntity>,
  ) {}

   // see all blocks
  async findAll(): Promise<BlocksEntity[]> {
    return await this.blocksRepository.find();
  }

  // block user
  async block(userId: string, blockId: string) {
    return await this.blocksRepository
      .createQueryBuilder()
      .insert()
      .values([
        {
          user_id: userId,
          blocked_user_id: blockId,
        },
      ])
      .execute()
      .catch((error) => {
        if ((error.code = '23505')) throw new BadRequestException();
      });
  }

  // unblock user
  async unblock(userId: string, blockId: string) {
    return await this.blocksRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id: blockId })
      .andWhere('user_id = :u', { u: userId })
      .execute()
      .catch((error) => {
        if ((error.code = '22P02')) throw new NotFoundException();
      });
  }

   // see all blocks for user
  async getBlocks(userId: string){
    return await this.blocksRepository
    .createQueryBuilder()
    .select()
    .where('user_id = :u', { u: userId })
    .execute();
  }
}
