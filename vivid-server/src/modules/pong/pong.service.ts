import { Injectable } from '@nestjs/common';
import { IGameState } from '@/game.interface';
import { v4 as uuid } from 'uuid';
import { Socket } from 'socket.io';
import { createGameState } from './create_gamestate';
import { gameLoop } from './pong';

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
  newGame(client: Socket) {
    // Return if client is already in existing game
    if (clientRooms[client.id] != null) return;

    let roomName: string = uuid();
    roomName = 'e372e47c-3649-44c9-9455-c48f84e3d80d'; // TODO remove this - hardcoded for testing

    // Store client-game relation
    clientRooms[client.id] = roomName;

    states[roomName] = createGameState();

    // Init canvas, context and eventlisteners
    client.emit('init', 1);

    client.join(roomName);
    client.number = 1;
  }

  joinGame(client: Socket, roomName: string) {
    // Return if client is already in existing game
    if (clientRooms[client.id] != null) return;

    // Return if game doesn't exist
    if (!states[roomName]) return;

    // TODO handle too many players

    // Store client-game relation
    clientRooms[client.id] = roomName;

    // Init canvas, context and eventlisteners
    client.emit('init', 2);

    client.join(roomName);
    client.number = 2;
  }

  startGameInterval(clients: any, roomName: string) {
    const intervalId = setInterval(() => {
      const winner: number = gameLoop(states[roomName]);

      if (!winner) {
        // If no winner, draw GameState for both clients
        clients.emit('drawGame', states[roomName]);
      } else {
        clients.emit('gameOver', winner);
        clearInterval(intervalId);

        // TODO create Match object and save in database
      }
    }, 1000 / 50); // 50 FPS
  }

  handleKeydown(client: any, move: number) {
    // Find room
    const roomName = clientRooms[client.id];
    if (!roomName) return;

    // Set player move
    states[roomName].players[client.number - 1].move = move;
  }
}
