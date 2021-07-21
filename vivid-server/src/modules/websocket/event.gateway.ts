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
import {
  IJoinedChannel,
  JoinedChannelEntity,
} from '~/models/joined_channels.entity';
import { UserEntity } from '~/models/user.entity';
import { PongService } from '../pong/pong.service';
import {
  connectClient,
  disconnectClient,
  getAllStatuses,
  registerCallback,
  UserStatus,
} from './statuses';
import { ChannelEntity } from '~/models/channel.entity';

@WebSocketGateway({ path: '/api/v1/events' })
export class EventGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userService: UserService,
    private readonly pongService: PongService,
  ) {
    registerCallback((s: UserStatus) => this.statusCallback(s));
  }

  /* CONNECTION HANDLING */
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

  async handleConnection(socket: Socket) {
    // get logged in user
    await this.putUserInSocket(socket);

    // if authenticated, connect to status listener
    if (socket.auth) connectClient(socket.auth, socket.id);
  }

  async handleDisconnect(socket: Socket) {
    disconnectClient(socket.id);
  }

  /* STATUSES */
  statusCallback(status: UserStatus) {
    // TODO only send status updates if user is related to client
    this.server.emit('status_update', status);
  }

  @SubscribeMessage('status_request')
  fetchStatuses(@ConnectedSocket() client: Socket) {
    if (!client.auth) return;
    client.emit('status_list', getAllStatuses());
  }

  /* CHANNELS */
  _sendToChannelMembers(event: string, data: any, members: IJoinedChannel[]) {
    const sockets = this.server.sockets.connected;
    const mappedJoins = members.reduce((a, v: IJoinedChannel) => {
      if (v.user.constructor === String) a[v.user as string] = true;
      else a[(v.user as any).id] = true;
      return a;
    }, {});
    for (const socketId in sockets) {
      const client = sockets[socketId];
      if (!client.auth) continue; // skip user if not authed
      if (!mappedJoins[client.auth]) continue; // skip if user not in channel
      client.emit(event, data);
    }
  }

  sendChannelMessage(
    message: IMessage,
    joins: IJoinedChannel[],
    user: UserEntity,
  ) {
    this._sendToChannelMembers('channel_message', { message, user }, joins);
  }

  deleteChannelMessage(
    channelId: string,
    joinedUsers: IJoinedChannel[],
    messageId: string,
  ) {
    this._sendToChannelMembers(
      'delete_channel_message',
      { channelId, messageId },
      joinedUsers,
    );
  }

  updateChannelUser(
    channelId: string,
    joinedUsers: IJoinedChannel[],
    newUser: JoinedChannelEntity,
  ) {
    this._sendToChannelMembers(
      'channel_user_update',
      {
        channelId,
        id:
          newUser.user.constructor === String
            ? newUser.user
            : (newUser.user as any).id,
        muted: newUser.is_muted,
        mod: newUser.is_mod,
        banned: newUser.is_banned,
        joined: newUser.is_joined,
      },
      joinedUsers,
    );
  }

  leaveChannelUser(
    channelId: string,
    joinedUsers: IJoinedChannel[],
    userId: string,
  ) {
    this._sendToChannelMembers(
      'channel_user_update',
      {
        channelId,
        id: userId,
        joined: false,
      },
      joinedUsers,
    );
  }

  updateChannel(
    channelId: string,
    joinedUsers: IJoinedChannel[],
    channel: ChannelEntity,
  ) {
    this._sendToChannelMembers(
      'channel_update',
      {
        channelId,
        channel,
      },
      joinedUsers,
    );
  }

  removeChannel(channelId: string, joinedUsers: IJoinedChannel[]) {
    this._sendToChannelMembers(
      'delete_channel',
      {
        channelId,
      },
      joinedUsers,
    );
  }

  /* GAME EVENTS */
  @SubscribeMessage('ready')
  readyEvent(@ConnectedSocket() client: Socket) {
    if (!client.auth) return;
    this.pongService.readyEvent(client);
  }

  @SubscribeMessage('pauseGame')
  pauseEvent(@ConnectedSocket() client: Socket) {
    if (!client.auth) return;
    this.pongService.pauseGame(client);
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
