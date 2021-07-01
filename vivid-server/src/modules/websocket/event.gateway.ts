import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IMessage } from '~/models/messages.entity';
import { UserService } from '$/users/user.service';
import { IJoinedChannel } from '~/models/joined_channels.entity';
import { createGameState } from '../pong/GameState';
import { IGameState } from '../pong/Constants';
import { gameLoop } from '../pong/Pong';
import { v4 as uuid } from 'uuid';

interface IRoom {
  [clientId: string]: uuid; // [clientId] = roomName
}

interface IStates {
  [roomName: string]: IGameState; // [roomName] = GameState
}

const states: IStates = {};
const clientRooms: IRoom = {};

@WebSocketGateway({ path: '/api/v1/events' })
export class EventGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly userService: UserService) {}

  async handleConnection(socket: Socket) {
    await this.putUserInSocket(socket);
  }

  sendChannelMessage(message: IMessage, joins: IJoinedChannel[]) {
    const sockets = this.server.sockets.connected;
    const mappedJoins = joins.reduce((a, v: IJoinedChannel) => {
      a[v.user as string] = true;
      return a;
    }, {});
    for (const socketId in sockets) {
      const client = sockets[socketId];
      if (!client.auth) continue; // skip user if not authed
      if (!mappedJoins[client.auth]) continue; // skip if user not in channel
      client.emit('channel_message', message);
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

  @SubscribeMessage('newGame')
  newGame(@MessageBody() clientId: string) {
    const client = this.server.sockets.connected[clientId];
    if (!client) return;

    // Return if client is already in existing game
    if (clientRooms[clientId] != null) return;

    // Create unique game ID
    const roomName = 'e372e47c-3649-44c9-9455-c48f84e3d80d'; // TODO remove this - hardcoded for testing
    // const roomName: string = uuid();
    clientRooms[clientId] = roomName;

    // Create GameState and save it in states
    states[roomName] = createGameState();

    // Join client to room
    client.join(roomName);

    // Init canvas, context and eventlisteners
    client.emit('init', 1);

    // Set client player number
    client.number = 1;
  }

  @SubscribeMessage('joinGame')
  joinGame(@MessageBody() body: { clientId: string; roomName: string }) {
    const client = this.server.sockets.connected[body.clientId];
    if (!client) return;

    // Return if client is already in existing game
    if (clientRooms[body.clientId] != null) return;

    if (clientRooms[body.roomName]) clientRooms[body.clientId] = body.roomName;

    // Join client to room
    client.join(body.roomName);

    // Init canvas, context and eventlisteners
    client.emit('init', 2);

    // Set client player number
    client.number = 2;

    // Start game
    this.startGameInterval(body.roomName);
  }

  @SubscribeMessage('keydown')
  handleKeydown(@MessageBody() body: { clientId: string; move: number }) {
    const client = this.server.sockets.connected[body.clientId];
    if (!client) return;

    // Find room
    const roomName = clientRooms[body.clientId];
    if (!roomName) return;

    // Set player move
    states[roomName].players[client.number - 1].move = body.move;
  }

  startGameInterval(roomName: string) {
    // Get clients in game
    const clients = this.server.sockets.in(roomName);

    const intervalId = setInterval(() => {
      const winner: number = gameLoop(states[roomName]);

      if (!winner) {
        // If no winner, render GameState for both clients
        clients.emit('render', states[roomName]);
      } else {
        clients.emit('gameOver', winner);
        clearInterval(intervalId);
      }
    }, 1000 / 50); // 50 FPS
  }
}
