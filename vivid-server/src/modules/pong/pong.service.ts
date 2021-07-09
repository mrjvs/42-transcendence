import { Injectable } from '@nestjs/common';
import { IGameState, IPlayer } from '@/game.interface';
import { v4 as uuid } from 'uuid';
import { Socket } from 'socket.io';
import { createGameState } from './create_gamestate';
import { gameLoop } from './pong';
import { MatchesService } from '$/matches/matches.service';

// TODO change client.idto client.id

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
    // const gameId: string = uuid();
    const gameId = 'e372e47c-3649-44c9-9455-c48f84e3d80d'; // TODO remove this - hardcoded for testing

    states[gameId] = createGameState(gameId);
    return gameId;
  }

  joinGame(userId: string, gameId: string) {
    // Return if client is already in existing game
    if (clientRooms[userId] != null) return;

    // Return if game doesn't exist
    if (!states[gameId]) return;

    // Check for empty spot and add user. Return if game is full
    const player = states[gameId].players.find((v) => v.userId === '');
    if (player) player.userId = userId;
    else return;

    // Store client-room relation
    clientRooms[userId] = gameId;
    return gameId;
  }

  readyEvent(client: Socket, gameId: string) {
    const game = states[gameId];

    // Return if game doesn't exist
    if (!game) return;

    const player = game.players.find((v) => v.userId === client.id);

    // Set player as spectator if player wasn't found
    if (!player)
      return {
        status: true,
        spectating: true,
      };

    // game.players[playerNb.ONE].ready = true;
    // if (game.players[playerNb.TWO].userId != '')
    //   game.players[playerNb.TWO].ready = true;
    player.ready = true;

    // Check if both players are ready and start game
    const readyPlayers: IPlayer[] = game.players.filter((v) => {
      if (v.ready) return v;
    });

    // Init canvas, context and eventlisteners
    client.emit('init');
    client.join(gameId);

    if (readyPlayers.length === 2) {
      client.emit('start', gameId);
    }
    return {
      status: true,
      spectating: false,
    };
  }

  startGameInterval(clients: Socket, gameId: string) {
    const intervalId = setInterval(async () => {
      const game = states[gameId];
      const winner: IPlayer | null = gameLoop(game);

      if (!winner) {
        // If no winner, draw GameState for both clients
        clients.emit('drawGame', game);
      } else {
        clients.emit('gameOver', winner.userId);
        clearInterval(intervalId);

        // this.matchService.insertGame({
        //   user_id_req: game.players[playerNb.ONE].userId,
        //   points_req: game.players[playerNb.ONE].score,
        //   user_id_acpt: game.players[playerNb.TWO].userId,
        //   points_acpt: game.players[playerNb.TWO].score,
        //   winner_id: winner.userId,
        //   game_type: '',
        // });

        delete clientRooms[game.players[playerNb.ONE].userId];
        delete clientRooms[game.players[playerNb.TWO].userId];
        delete states[gameId];
      }
    }, 1000 / 50); // 50 FPS
  }

  handleKeydown(client: Socket, move: number) {
    // Find room
    // const gameId = clientRooms[client.auth];
    const gameId = 'e372e47c-3649-44c9-9455-c48f84e3d80d';

    if (!gameId) return;

    const playerNumber: playerNb =
      states[gameId].players[playerNb.ONE].userId === client.id
        ? playerNb.ONE
        : playerNb.TWO;

    // Set player move
    if (states[gameId].settings.controls === 'keys')
      states[gameId].players[playerNumber].move = move;
  }

  handleMouseMove(client: Socket, move: number) {
    // Find room
    const gameId = clientRooms[client.id];
    if (!gameId) return;

    const playerNumber: playerNb =
      states[gameId].players[playerNb.ONE].userId === client.id
        ? playerNb.ONE
        : playerNb.TWO;

    // Set player move
    if (states[gameId].settings.controls === 'mouse')
      states[gameId].players[playerNumber].y =
        move - states[gameId].playerHeight / 2;
  }
}
