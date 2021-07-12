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
import { IJoinedChannel } from '~/models/joined_channels.entity';
import { UserEntity } from '~/models/user.entity';
import { PongService } from '../pong/pong.service';
import {
  connectClient,
  disconnectClient,
  getAllStatuses,
  registerCallback,
  UserStatus,
} from './statuses';

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

  /* MESSAGES */
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

  /* GAME EVENTS */
  @SubscribeMessage('newGame')
  newGame(@ConnectedSocket() client: Socket) {
    if (!client.auth) return; // TODO do we need to throw something (unauthorized) here?
    this.pongService.newGame(client);
  }

  @SubscribeMessage('joinGame')
  joinGame(@ConnectedSocket() client: Socket, @MessageBody() roomName: string) {
    if (!client.auth) return;
    this.pongService.joinGame(client, roomName);
  }

  @SubscribeMessage('ready')
  readyEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomName: string,
  ) {
    if (!client.auth) return;
    this.pongService.readyEvent(client, roomName);
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
