import { Injectable } from '@nestjs/common';
import { IGameState, IPlayer } from '@/game.interface';
import { v4 as uuid } from 'uuid';
import { Socket } from 'socket.io';
import { createGameState } from './create_gamestate';
import { gameLoop } from './pong';
import { MatchesService } from '$/matches/matches.service';

// TODO change client.id to client.auth

interface IRoom {
  [clientId: string]: string; // [clientId] = roomName
}

interface IStates {
  [roomName: string]: IGameState; // [roomName] = GameState
}

const states: IStates = {};
const clientRooms: IRoom = {};

@Injectable()
export class PongService {
  constructor(private matchService: MatchesService) {}

  newGame(client: Socket) {
    // Return if client is already in existing game
    if (clientRooms[client.id] != null) return;

    let roomName: string = uuid();
    roomName = 'e372e47c-3649-44c9-9455-c48f84e3d80d'; // TODO remove this - hardcoded for testing

    states[roomName] = createGameState(roomName);
    return roomName;
  }

  joinGame(client: Socket, roomName: string) {
    // Return if client is already in existing game
    if (clientRooms[client.id] != null) return;

    // Return if game doesn't exist
    if (!states[roomName]) return;

    // Check for empty spot and add user. Retrurn if game is full
    const player = states[roomName].players.find((v) => v.userId === '');
    if (player) player.userId = client.id;
    else return;

    // Store client-room relation
    clientRooms[client.id] = roomName;

    // Init canvas, context and eventlisteners
    client.emit('init');

    client.join(roomName);
    client.number = player.playerNumber;
  }

  readyEvent(client: Socket, roomName: string) {
    const game = states[roomName];

    // Return if game doesn't exist
    if (!game) return;

    const player = game.players.find((v) => v.userId === client.id);

    // Set player as spectator if player wasn't found
    if (!player)
      return {
        status: true,
        spectating: true,
      };

    player.ready = true;

    // Check if both players are ready and start game
    const readyPlayers: IPlayer[] = game.players.filter((v) => {
      if (v.ready === true) return v;
    });
    if (readyPlayers.length === 2) client.emit('start', roomName);

    return {
      status: true,
      spectating: false,
    };
  }

  startGameInterval(clients: Socket, roomName: string) {
    const intervalId = setInterval(async () => {
      const game = states[roomName];
      const winner: IPlayer | null = gameLoop(game);

      if (!winner) {
        // If no winner, draw GameState for both clients
        clients.emit('drawGame', game);
      } else {
        clients.emit('gameOver', winner.userId);
        clearInterval(intervalId);

        this.matchService.createGame({
          user_id_req: game.players[0].userId,
          points_req: game.players[0].score,
          user_id_acpt: game.players[1].userId,
          points_acpt: game.players[1].score,
          winner_id: winner.userId,
          game_type: '',
        });

        clientRooms[game.players[0].userId] = null;
        clientRooms[game.players[1].userId] = null;
        states[roomName] = null;
      }
    }, 1000 / 50); // 50 FPS
  }

  handleKeydown(client: Socket, move: number) {
    // Find room
    const roomName = clientRooms[client.id];
    if (!roomName) return;

    // Set player move
    if (states[roomName].settings.controls === 'keys')
      states[roomName].players[client.number - 1].move = move;
  }

  handleMouseMove(client: Socket, move: number) {
    // Find room
    const roomName = clientRooms[client.id];
    if (!roomName) return;

    // Set player move
    if (states[roomName].settings.controls === 'mouse')
      states[roomName].players[client.number - 1].y =
        move - states[roomName].playerHeight / 2;
  }
}
