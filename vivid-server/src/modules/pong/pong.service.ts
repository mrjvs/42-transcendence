import { Injectable } from '@nestjs/common';
import { IGameState, IPlayer } from '@/game.interface';
import { v4 as uuid } from 'uuid';
import { Socket } from 'socket.io';
import { createGameState } from './create_gamestate';
import { gameLoop } from './pong';
import { MatchesService } from '$/matches/matches.service';

interface IRoom {
  [clientId: string]: string; // [clientId] = gameId
}

interface IStates {
  [gameId: string]: IGameState; // [gameId] = GameState
}

enum playerNb {
  ONE,
  TWO,
}

const states: IStates = {};
const clientRooms: IRoom = {};

@Injectable()
export class PongService {
  constructor(private matchService: MatchesService) {}

  createGame() {
    const gameId: string = uuid();
    states[gameId] = createGameState(gameId);
    return gameId;
  }

  joinGame(userId: string, gameId: string): { gameId: string } {
    // Return if client is already in existing game
    if (clientRooms[userId] != null) return;

    if (!states[gameId]) return;

    // Check for empty spot and add user. Return if game is full
    const player: IPlayer = states[gameId].players.find((v) => v.userId === '');
    if (player) player.userId = userId;
    else return;

    clientRooms[userId] = gameId;
    return {
      gameId: gameId,
    };
  }

  readyEvent(client: Socket) {
    const gameId: string = clientRooms[client.auth];
    if (!gameId) return;

    const game: IGameState = states[gameId];
    if (!game) return;

    client.join(gameId);

    // Set player as ready or spectator
    const player = game.players.find((v) => v.userId === client.auth);
    if (!player)
      return {
        status: true,
        spectating: true,
      };

    player.ready = true;
    client.emit('init');

    // Check if both players are ready and start game
    const readyPlayers: IPlayer[] = game.players.filter((v) => {
      if (v.ready) return v;
    });
    if (readyPlayers.length === 2) client.emit('start', gameId);

    return {
      status: true,
      spectating: false,
    };
  }

  startGameInterval(clients: Socket, gameId: string) {
    const intervalId = setInterval(async () => {
      const game: IGameState = states[gameId];
      const winner: IPlayer | null = gameLoop(game);

      if (!winner) {
        clients.emit('drawGame', game);
      } else {
        clients.emit('gameOver', winner.userId);
        clearInterval(intervalId);

        this.matchService.createGame({
          user_id_req: game.players[playerNb.ONE].userId,
          points_req: game.players[playerNb.ONE].score,
          user_id_acpt: game.players[playerNb.TWO].userId,
          points_acpt: game.players[playerNb.TWO].score,
          winner_id: winner.userId,
          game_type: '',
        });

        delete clientRooms[game.players[playerNb.ONE].userId];
        delete clientRooms[game.players[playerNb.TWO].userId];
        delete states[gameId];
      }
    }, 1000 / 50);
  }

  handleKeydown(client: Socket, move: number) {
    const gameId: string = clientRooms[client.auth];
    if (!gameId) return;

    const playerNumber: playerNb =
      states[gameId].players[playerNb.ONE].userId === client.auth
        ? playerNb.ONE
        : playerNb.TWO;

    if (states[gameId].settings.controls === 'keys')
      states[gameId].players[playerNumber].move = move;
  }

  handleMouseMove(client: Socket, move: number) {
    const gameId: string = clientRooms[client.auth];
    if (!gameId) return;

    const playerNumber: playerNb =
      states[gameId].players[playerNb.ONE].userId === client.auth
        ? playerNb.ONE
        : playerNb.TWO;

    if (states[gameId].settings.controls === 'mouse')
      states[gameId].players[playerNumber].y =
        move - states[gameId].playerHeight / 2;
  }
}
