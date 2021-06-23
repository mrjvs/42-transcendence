import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '~/middleware/decorators/login.decorator';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { BlocksEntity } from '@/blocks.entity';
import { UserEntity } from '@/user.entity';
import { UserService } from '$/users/user.service';
import { BlocksService } from './blocks.service';
import { DeleteResult, UpdateResult } from 'typeorm';

@Controller('blocks')
@UseGuards(AuthenticatedGuard)
export class BlocksController {
  constructor(
    private blocksService: BlocksService,
    private userService: UserService,
  ) {}

  // see all blocks
  // @MustbeAdmin() TODO
  @Get('all')
  findAll(): Promise<BlocksEntity[]> {
    return this.blocksService.findAll();
  }

  // block user
  @Post('block/:block_id')
  async blockUser(
    @Param('block_id') userToBlockId: string,
    @User() user: UserEntity,
  ): Promise<UpdateResult> {
    // checking if friend is in general user table
    const user_to_block = await this.userService.findUser(userToBlockId);
    if (!user_to_block) throw new NotFoundException();

    // checking if friend is the logged in user
    if (user.id === userToBlockId) throw new BadRequestException();

    return this.blocksService.block(user.id, userToBlockId);
  }

  // unblock user
  @Delete('unblock/:block_id')
  async unblockUser(
    @Param('block_id') blockId: string,
    @User() user: UserEntity,
  ): Promise<DeleteResult> {
    return this.blocksService.unblock(user.id, blockId);
  }

  // see all blocks for user
  @Get('blockedlist')
  async blocked_users(@User() user: UserEntity): Promise<BlocksEntity[]> {
    return this.blocksService.getBlocks(user.id);
  }
}
