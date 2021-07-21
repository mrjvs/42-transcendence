import { Injectable } from '@nestjs/common';
import { IGameState, IPlayer } from '@/game.interface';
import { v4 as uuid } from 'uuid';
import { Socket } from 'socket.io';
import { createGameState } from './create_gamestate';
import { gameLoop as renderGameLoop } from './Pong_simple';
import { MatchesService } from '$/matches/matches.service';

interface IClientGameMap {
  [clientId: string]: string; // [clientId] = gameId
}

interface IClientUserMap {
  [userId: string]: string; // [userId] = gameId
}

interface IStates {
  [gameId: string]: GameState; // [gameId] = GameState
}

enum PlayerInputs {
  UP = 'up',
  DOWN = 'down',
  ACTION = 'action',
}
enum PlayerInputState {
  KEYDOWN = 'keydown',
  KEYUP = 'keyup',
  PRESS = 'press',
}

export class GameState {
  #state: IGameState;
  #interval: NodeJS.Timeout | null;
  #callback: (game: IGameState) => void;

  constructor(gameId: string, onFinish: (game: IGameState) => void) {
    this.#state = createGameState(gameId);
    this.#interval = null;
    this.#callback = onFinish;
  }

  get playerCount() {
    return this.#state.players.filter((v) => v.userId !== null).length;
  }
  get playerReadyCount() {
    return this.#state.players.filter((v) => v.ready).length;
  }
  get isInProgress() {
    return this.#interval !== null;
  }

  getPlayerFromClient(client: any) {
    if (!client) return null;
    const found = this.#state.players.find((v) => v.client === client);
    if (!found) return null;
    return found;
  }

  // emit data to all clients (including spectators)
  emitToClients(event: string, data?: any) {
    const clients = [];
    this.#state.players
      .filter((v) => v.client)
      .forEach((v) => clients.push(v.client));
    clients.forEach((c) => {
      c.emit(event, data);
    });
  }

  // code run on every tick
  gameloop() {
    const winner: IPlayer | null = renderGameLoop(this.#state);

    // no winner, render game
    if (!winner) {
      const formattedData = {
        gameId: this.#state.gameId,
        players: this.#state.players.map((p) => ({
          ...p,
          move: 0,
          spacebar: 0,
          shoot: 0,
          client: null,
        })),
        settings: {
          ...this.#state.settings,
        },
        ball: {
          ...this.#state.ball,
        },
        increaseSpeedAfterContact: this.#state.increaseSpeedAfterContact,
      };
      this.emitToClients('drawGame', formattedData);
      return;
    }

    // send end event
    this.emitToClients('gameOver', winner.userId);

    // stop gameloop
    this.stopGame();
  }

  // start if every player is ready
  startGameIfAble() {
    // check if everybody is ready
    if (this.playerReadyCount < 2) return;

    // if game is no longer active, error out
    if (this.#state.finished) return;

    // start game
    this.emitToClients('start');

    if (!this.isInProgress)
      this.#interval = setInterval(() => {
        this.gameloop();
      }, 1000 / 50);
  }

  // stop game
  stopGame() {
    if (this.isInProgress) clearInterval(this.#interval);
    this.#interval = null;
    if (this.#state.finished) return;
    this.#state.finished = true;
    try {
      this.#callback(this.#state);
    } catch (err) {}
  }

  disconnectClient(client: any) {
    if (!client) return false;
    const player = this.#state.players.find((v) => v.client === client);
    if (!player) return false;

    // stop game because of disconnect
    this.stopGame();
  }

  // register user for game
  addUser(userId: string): void {
    if (this.playerCount >= 2) throw new Error('game is full');

    this.#state.players.find((v) => v.userId === null).userId = userId;
  }

  // user is connected and ready for game
  setReady(client: any) {
    // check if client is authed
    if (!client || !client.auth) return 'notregistered';

    // find player
    const player = this.#state.players.find((v) => v.userId === client.auth);
    if (!player) return 'notregistered';

    player.ready = true;
    player.client = client;

    this.startGameIfAble();
  }

  // input events
  handleInput(client: any, key: PlayerInputs, keyState: PlayerInputState) {
    const player = this.getPlayerFromClient(client);
    if (!player) return false;
    if (keyState === PlayerInputState.KEYUP) {
      // TODO record seperate inputs
      if (key === PlayerInputs.UP || key === PlayerInputs.DOWN) player.move = 0;
      else return false;
    } else if (keyState === PlayerInputState.KEYDOWN) {
      if (key === PlayerInputs.UP) player.move = -0.01;
      else if (key === PlayerInputs.DOWN) player.move = 0.01;
      else return false;
    } else if (keyState === PlayerInputState.PRESS) {
      if (key === PlayerInputs.ACTION) {
        // TODO ??
      } else return false;
    }
    return true;
  }
}

const states: IStates = {};
const clientGameMap: IClientGameMap = {};
const clientUserMap: IClientUserMap = {};

@Injectable()
export class PongService {
  constructor(private matchService: MatchesService) {}

  createGame() {
    const gameId: string = uuid();
    states[gameId] = new GameState(gameId, (state) => {
      // remove clients from maps
      state.players.forEach((v) => {
        // remove states from maps
        if (clientUserMap[v.userId]) clientUserMap[v.userId] = undefined;
        if (clientGameMap[v.client.id]) clientGameMap[v.client.id] = undefined;
      });

      // remove gamestate
      states[state.gameId] = undefined;

      // TODO save match
      console.log('Someone won, lol');
    });
    return gameId;
  }

  joinGame(userId: string, gameId: string): { gameId: string } | false {
    const game = states[gameId];
    if (!game) return false;

    // check if client is already ingame
    const isUserAlreadyJoined = !!clientUserMap[userId];
    if (isUserAlreadyJoined) return;

    game.addUser(userId);
    return {
      gameId: gameId,
    };
  }

  onDisconnect(client: Socket) {
    const gameId = clientGameMap[client.id];
    if (!gameId) return;

    const game = states[gameId];
    game.disconnectClient(client);
  }

  readyEvent(client: Socket, gameId: string) {
    const game = states[gameId];
    if (!game) return;

    client.join(gameId);
    const res = game.setReady(client);
    if (res === 'notregistered') {
      return {
        status: false,
      };
    }

    clientGameMap[client.id] = gameId;
    clientUserMap[client.auth] = gameId;
    return {
      status: true,
      spectating: false,
    };
  }

  handleKeydown(client: Socket, key: PlayerInputs) {
    const gameId = clientGameMap[client.id];
    if (!gameId) return;

    const game = states[gameId];
    if (!game) return;

    game.handleInput(client, key, PlayerInputState.KEYDOWN);
  }

  handleKeyup(client: Socket, key: PlayerInputs) {
    const gameId = clientGameMap[client.id];
    if (!gameId) return;

    const game = states[gameId];
    if (!game) return;

    game.handleInput(client, key, PlayerInputState.KEYUP);
  }

  handlePress(client: Socket, key: PlayerInputs) {
    const gameId = clientGameMap[client.id];
    if (!gameId) return;

    const game = states[gameId];
    if (!game) return;

    game.handleInput(client, key, PlayerInputState.PRESS);
  }
}
