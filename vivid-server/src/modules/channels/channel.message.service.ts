import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DeleteResult, Repository } from 'typeorm';
import { Observable, from } from 'rxjs';
// import { parse } from 'cookie';
import {
  MessageEntity,
  IMessage,
  IMessageInput,
  PaginationDto,
} from '@/messages.entity';
// import { UserService } from '$/users/user.service';
import { Socket } from 'socket.io';
import { ChannelMessageGateway } from './channel.message.gateway';

@Injectable()
export class ChannelMessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private MessageRepository: Repository<MessageEntity>, // private readonly userService: UserService,
    private readonly messageGateway: ChannelMessageGateway,
  ) {}

  async postMessage(messageInput: IMessageInput): Promise<IMessage> {
    const result = await this.MessageRepository.save(messageInput);
    this.messageGateway.sendChannelMessage(result);
    return result;
  }

  getMessages(
    id: string,
    paginationDto: PaginationDto,
  ): Observable<MessageEntity[]> {
    return from(
      this.MessageRepository.find({
        where: {
          channel: id,
          created_at: Between(paginationDto.date1, paginationDto.date2),
        },
        order: {
          created_at: 'ASC',
        },
      }),
    );
  }

  async deleteMessage(
    channelId: string,
    messageId: string,
    userId?: string,
  ): Promise<{ id: string }> {
    let builder: any = this.MessageRepository.createQueryBuilder();
    builder = builder
      .delete()
      .where('channel = :channelId', { id: channelId })
      .where('id = :messageId', { messageId: messageId });

    if (userId) {
      builder = builder.where('user = :owner', { owner: userId });
    }

    const result: DeleteResult = await builder.execute();
    if (result.affected !== 1) throw new NotFoundException();
    return { id: messageId };
  }

  async getUserFromSocket(socket: Socket) {
    // console.log(socket.handshake);
  }
}
