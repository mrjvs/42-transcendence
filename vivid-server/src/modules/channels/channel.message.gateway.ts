import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IMessage } from '~/models/messages.entity';
// import { ChannelMessageService } from './channel.message.service';

@WebSocketGateway()
export class ChannelMessageGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor() {}

  async handleConnection(socket: Socket) {
    // await this.chatService.getUserFromSocket(socket);
  }

  sendChannelMessage(message: IMessage) {
    this.server.emit('channel_message', message);
  }
}
