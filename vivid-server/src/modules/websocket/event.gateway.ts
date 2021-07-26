import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { IMessage } from '@/messages.entity';
import { UserService } from '$/users/user.service';
import { IJoinedChannel, JoinedChannelEntity } from '@/joined_channels.entity';
import { UserEntity } from '@/user.entity';
import { PongService } from '$/pong/pong.service';
import {
  connectClient,
  disconnectClient,
  getAllStatuses,
  registerCallback,
  UserStatus,
} from './statuses';
import { ChannelEntity } from '@/channel.entity';
import { MatchMakingService } from '$/ladder/matchmaking.service';
import { forwardRef, Inject } from '@nestjs/common';
import { FriendsEntity } from '~/models/friends.entity';

let server;

@WebSocketGateway({ path: '/api/v1/events' })
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly pongService: PongService,
    private readonly matchmakingService: MatchMakingService,
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
    if (!server) server = socket.server;

    // get logged in user
    await this.putUserInSocket(socket);

    // if authenticated, connect to status listener
    if (socket.auth) connectClient(socket.auth, socket.id);
  }

  async handleDisconnect(socket: Socket) {
    try {
      disconnectClient(socket.id);
    } catch (err) {}
    try {
      this.pongService.onDisconnect(socket);
    } catch (err) {}
    try {
      this.matchmakingService.leavePool(socket);
    } catch (err) {}
  }

  async logoutUser(id: string) {
    if (!server) return;
    const sockets = server.sockets.connected;
    for (const socketId in sockets) {
      const client = sockets[socketId];
      if (!client.auth) continue; // skip user if not authed
      if (client.auth !== id) continue; // skip if not the user
      client.emit('logout');
      client.disconnect();
    }
  }

  /* STATUSES */
  statusCallback(status: UserStatus) {
    if (!server) return;
    server.emit('status_update', status);
  }

  @SubscribeMessage('status_request')
  fetchStatuses(@ConnectedSocket() client: Socket) {
    if (!client.auth) return;
    client.emit('status_list', getAllStatuses());
  }

  /* CHANNELS */
  _sendToChannelMembers(event: string, data: any, members: IJoinedChannel[]) {
    if (!server) return;
    const sockets = server.sockets.connected;
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
  readyEvent(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    if (!client.auth) return;
    if (!body?.gameId) return;
    this.pongService
      .readyEvent(client, body.gameId)
      .then((result) => {
        if (result.constructor !== String) {
          client.emit('readyReturn', {
            status: 'finished',
            match: result.match,
          });
        } else {
          client.emit('readyReturn', {
            status: result,
          });
        }
      })
      .catch(() => true);
  }

  @SubscribeMessage('keydown')
  handleKeydown(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    this.pongService.handleKeydown(client, body.key);
  }

  @SubscribeMessage('keyup')
  handleKeyup(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    this.pongService.handleKeyup(client, body.key);
  }

  @SubscribeMessage('keypress')
  handlePress(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    this.pongService.handlePress(client, body.key);
  }

  @SubscribeMessage('gameleave')
  leaveGameEvent(@ConnectedSocket() client: Socket) {
    if (!client.auth) return;
    this.pongService.onDisconnect(client);
  }

  @SubscribeMessage('subscribeGame')
  subscribeGameEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() gameId: string,
  ) {
    if (!client.auth) return;
    if (!gameId) return;
    this.pongService.subscribeEvent(client, gameId);
  }

  /* MATCHMAKING */
  @SubscribeMessage('matchmaking')
  async joinMatchmaking(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: any,
  ) {
    if (!client || !client.auth) return;
    if (!body || !body?.ladderId) return;
    try {
      await this.matchmakingService.joinPool(client, body.ladderId);
    } catch (err) {}
  }
  @SubscribeMessage('matchmakingLeave')
  async leaveMatchmaking(@ConnectedSocket() client: Socket) {
    if (!client || !client.auth) return;
    this.matchmakingService.leavePool(client);
  }

  /* FRIENDSHIPS */
  updateFriendships(friend: FriendsEntity) {
    if (!server) return;
    const ids = [(friend.user_1 as any).id, (friend.user_2 as any).id];
    const sockets = server.sockets.connected;
    for (const socketId in sockets) {
      const client = sockets[socketId];
      if (!client.auth) continue; // skip user if not authed
      if (!ids.includes(client.auth)) continue; // skip if user not related
      client.emit('friendship_update', friend);
    }
  }
  removeFriendships(friend: FriendsEntity) {
    if (!server) return;
    const ids = [(friend.user_1 as any).id, (friend.user_2 as any).id];
    const sockets = server.sockets.connected;
    for (const socketId in sockets) {
      const client = sockets[socketId];
      if (!client.auth) continue; // skip user if not authed
      if (!ids.includes(client.auth)) continue; // skip if user not related
      client.emit('friendship_remove', friend.id);
    }
  }
}
