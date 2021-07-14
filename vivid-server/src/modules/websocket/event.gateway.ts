import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IMessage } from '@/messages.entity';
import { UserService } from '$/users/user.service';
import { IJoinedChannel } from '@/joined_channels.entity';
import { UserEntity } from '@/user.entity';
import { PongService } from '$/pong/pong.service';

@WebSocketGateway({ path: '/api/v1/events' })
export class EventGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userService: UserService,
    private readonly pongService: PongService,
  ) {}

  async handleConnection(socket: Socket) {
    await this.putUserInSocket(socket);
  }

  sendChannelMessage(
    message: IMessage,
    joins: IJoinedChannel[],
    user: UserEntity,
  ) {
    const data = {
      message,
      user,
    };
    const sockets = this.server.sockets.connected;
    const mappedJoins = joins.reduce((a, v: IJoinedChannel) => {
      a[v.user as string] = true;
      return a;
    }, {});
    for (const socketId in sockets) {
      const client = sockets[socketId];
      if (!client.auth) continue; // skip user if not authed
      if (!mappedJoins[client.auth]) continue; // skip if user not in channel
      client.emit('channel_message', data);
    }
  }

  deleteChannelMessage(
    channelId: string,
    joinedUsers: IJoinedChannel[],
    messageId: string,
  ) {
    const sockets = this.server.sockets.connected;
    const mappedJoins = joinedUsers.reduce((a, v: IJoinedChannel) => {
      a[v.user as string] = true;
      return a;
    }, {});
    for (const socketId in sockets) {
      const client = sockets[socketId];
      if (!client.auth) continue; // skip user if not authed
      if (!mappedJoins[client.auth]) continue; // skip if user not in channel
      client.emit('delete_channel_message', channelId, messageId);
    }
  }

  async putUserInSocket(socket: Socket) {
    socket.auth = null;
    if (!socket?.handshake?.headers?.cookie) {
      return null;
    }
    try {
      const res = await this.userService.getUserIdFromCookie(
        socket.handshake.headers.cookie,
      );
      if (res) socket.auth = res;
    } catch (err) {}
  }

  @SubscribeMessage('ready')
  readyEvent(@ConnectedSocket() client: Socket) {
    if (!client.auth) return;
    this.pongService.readyEvent(client);
  }

  @SubscribeMessage('keydown')
  handleKeydown(
    @ConnectedSocket() client: Socket,
    @MessageBody() move: number,
  ) {
    if (!client.auth) return;
    this.pongService.handleKeydown(client, move);
  }

  @SubscribeMessage('start')
  startGameInterval(@MessageBody() roomName: string) {
    const clients = this.server.sockets.in(roomName);
    if (!clients) return;
    this.pongService.startGameInterval(clients, roomName);
  }

  @SubscribeMessage('mouseMove')
  handleMouseMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() move: number,
  ) {
    if (!client.auth) return;
    this.pongService.handleMouseMove(client, move);
  }
}
