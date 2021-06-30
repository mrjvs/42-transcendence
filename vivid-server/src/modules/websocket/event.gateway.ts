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
// import { GameState } from '../../../../vivid-client/src/views/Game/game';
// import { gameLoop } from '../../pong/Pong';

@WebSocketGateway({ path: '/api/v1/events' })
export class EventGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly userService: UserService) {}

  async handleConnection(socket: Socket) {
    console.log('handle connection');
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

  @SubscribeMessage('startGame')
  startGameInterval(@MessageBody() state: string) {
    console.log(state);
    console.log('hello');
    return 'test';
    // const intervalId = setInterval(() => {
    //   const winner = gameLoop(gameState);

    //   if (!winner) client.emit('gamestate', gameState);
    //   // if (!winner) client.emit('gamestate', JSON.stringify(gameState));
    //   else {
    //     client.emit('gameOver');
    //     clearInterval(intervalId);
    //   }
    // }, 1000 / 50);
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
}
