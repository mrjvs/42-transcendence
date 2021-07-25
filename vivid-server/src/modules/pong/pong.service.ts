import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  EndReasons,
  GameProgress,
  IGameState,
  IPlayer,
} from '$/pong/game.interface';
import { v4 as uuid } from 'uuid';
import { Socket } from 'socket.io';
import { createGameState } from './createGameState';
import { gameLoop as renderGameLoop, resetField } from './pong';
import { MatchesService } from '$/matches/matches.service';
import { UserService } from '$/users/user.service';
import { IMatch } from '@/matches.entity';
import { UserEntity } from '@/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LadderService } from '$/ladder/ladder.service';
import { setUserStatus, Status } from '$/websocket/statuses';

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

  constructor(
    gameId: string,
    enabledAddons: string[],
    onFinish: (game: IGameState) => void,
  ) {
    this.#state = createGameState(gameId, enabledAddons);
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
    this.#state.spectators
      .filter((v) => v.client)
      .forEach((v) => clients.push(v.client));
    clients.forEach((c) => {
      c.emit(event, data);
    });
  }

  renderCountDown() {
    this.#state.countdownTicks -= 1;
    if (this.#state.countdownTicks <= 0) {
      this.#state.countdownTicks = 1000 / this.#state.settings.ticksPerMs;
      this.#state.countdownNum -= 1;
    }
  }

  createState() {
    return {
      gameId: this.#state.gameId,
      players: this.#state.players.map((p) => ({
        ...p,
        spacebar: 0,
        shoot: 0,
        client: null,
      })),
      settings: {
        ...this.#state.settings,
        addons: [...this.#state.settings.addons],
      },
      ball: {
        ...this.#state.ball,
      },
      gameProgress: this.#state.gameProgress,
      spectators: this.#state.spectators.map((v) => v.client.id),
      subscribers: [],
      countdownNum: this.#state.countdownNum,
      countdownTicks: this.#state.countdownTicks,
      endReason: this.#state.endReason,
      increaseSpeedAfterContact: this.#state.increaseSpeedAfterContact,
      winner: this.#state.winner,
      amountOfSeconds: this.#state.amountOfSeconds,
    };
  }

  // code run on every tick
  gameloop() {
    if (this.#state.gameProgress === GameProgress.COUNTDOWN) {
      this.renderCountDown();
      if (this.#state.countdownNum <= 0) {
        this.setAndSendStatus(GameProgress.PLAYING);
      }
      this.emitToClients('drawGame', this.createState());
      return;
    }

    this.#state.countdownTicks -= 1;
    if (this.#state.countdownTicks <= 0) {
      this.#state.countdownTicks = 1000 / this.#state.settings.ticksPerMs;
      this.#state.amountOfSeconds += 1;
    }
    this.#state.winner = renderGameLoop(this.#state);
    this.emitToClients('drawGame', this.createState());

    if (this.#state.winner) {
      // stop gameloop
      this.stopGame(EndReasons.FAIRFIGHT);
      return;
    }
  }

  // start if every player is ready
  startGameIfAble() {
    // check if everybody is ready
    if (this.playerReadyCount < 2) return;

    // if game is no longer active, error out
    if (this.#state.gameProgress !== GameProgress.WAITING) return;

    // start game
    this.setAndSendStatus(GameProgress.COUNTDOWN);
    this.#state.countdownNum = 5;
    this.#state.countdownTicks =
      this.#state.settings.ticksPerMs / this.#state.settings.ticksPerMs;
    this.emitToClients('start');

    // do initial render to set correct data
    resetField(this.#state);

    if (!this.isInProgress)
      this.#interval = setInterval(() => {
        this.gameloop();
      }, this.#state.settings.ticksPerMs);
  }

  // stop game
  stopGame(reason: EndReasons) {
    if (this.isInProgress) clearInterval(this.#interval);
    this.#interval = null;
    if (
      ![GameProgress.PLAYING, GameProgress.COUNTDOWN].includes(
        this.#state.gameProgress,
      )
    ) {
      this.setAndSendStatus(GameProgress.CANCELLED);
      this.#state.endReason = EndReasons.CANCELLED;
    } else {
      this.setAndSendStatus(GameProgress.FINISHED);
      this.#state.endReason = reason;
    }
    this.emitToClients('drawGame', this.createState());
    try {
      this.#callback(this.#state);
    } catch (err) {}
  }

  disconnectClient(client: any) {
    if (!client) return false;
    const player = this.#state.players.findIndex((v) => v.client === client);
    if (player == -1) return false;

    // set winner to other player
    this.#state.winner = this.#state.players[player == 0 ? 1 : 0].userId;

    // stop game because of disconnect
    this.stopGame(EndReasons.RAGEQUIT);
  }

  // register user for game
  addUser(userId: string): void {
    if (this.playerCount >= 2) throw new Error('game is full');

    this.#state.players.find((v) => v.userId === null).userId = userId;
  }

  // user is connected and ready for game
  async setReady(client: any, userService?: UserService): Promise<string> {
    // check if client is authed
    if (!client || !client.auth) return 'notregistered';

    // find player
    const player = this.#state.players.find(
      (v) => v.userId === client.auth && !v.client,
    );
    if (!player) {
      this.#state.spectators.push({
        client,
      });
      return 'spectator';
    }

    const user = await userService.findUser(client.auth, []);

    player.ready = true;
    player.name = user.name;
    player.client = client;

    this.startGameIfAble();
    return 'playing';
  }

  // input events
  handleInput(client: any, key: PlayerInputs, keyState: PlayerInputState) {
    const player = this.getPlayerFromClient(client);
    if (!player) return false;
    if (keyState === PlayerInputState.KEYUP) {
      if (key === PlayerInputs.UP) {
        player.holdingUp = 0;
      } else if (key === PlayerInputs.DOWN) {
        player.holdingDown = 0;
      } else return false;
    } else if (keyState === PlayerInputState.KEYDOWN) {
      if (key === PlayerInputs.UP) {
        player.holdingUp = 1;
        player.lastPressed = key;
      } else if (key === PlayerInputs.DOWN) {
        player.holdingDown = 1;
        player.lastPressed = key;
      } else return false;
    } else if (keyState === PlayerInputState.PRESS) {
      if (key === PlayerInputs.ACTION) {
        if (player.spacebar == 0) player.spacebar = 1;
      } else return false;
    }
    return true;
  }

  setAndSendStatus(status: GameProgress) {
    this.#state.gameProgress = status;
    let toSend = status;
    if (toSend === GameProgress.CANCELLED) toSend = GameProgress.FINISHED;
    this.#state.subscribers.forEach((v) => {
      v.client.emit('gameSubscribeReturn', {
        gameId: this.#state.gameId,
        status: toSend,
      });
    });
  }

  sendCurrentStatus(client: any) {
    let toSend = this.#state.gameProgress;
    if (toSend === GameProgress.CANCELLED) toSend = GameProgress.FINISHED;
    client.emit('gameSubscribeReturn', {
      gameId: this.#state.gameId,
      status: toSend,
    });
  }

  subscribeClient(client: any) {
    this.sendCurrentStatus(client);
    const found = this.#state.subscribers.find(
      (v) => v.client.id === client.id,
    );
    if (found) return;
    this.#state.subscribers.push({ client });
  }
}

const states: IStates = {};
const clientGameMap: IClientGameMap = {};
const clientUserMap: IClientUserMap = {};

@Injectable()
export class PongService {
  constructor(
    private matchService: MatchesService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => LadderService))
    private ladderService: LadderService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  createGame(type: string, ladderId?: string, enabledAddons?: string[]) {
    const gameId: string = uuid();
    states[gameId] = new GameState(gameId, enabledAddons, (state) => {
      // save if game occured and not cancelled
      if (state.gameProgress !== GameProgress.CANCELLED) {
        this.matchService
          .saveMatchResults(state, new Date(), type)
          .catch(() => true);

        if (type === 'ranked') {
          this.ladderService
            .adjustRating(
              state.players[0].userId,
              state.players[1].userId,
              ladderId,
              state.winner,
            )
            .catch(() => true);
        }
      }

      // remove clients from maps
      state.players.forEach((v) => {
        setUserStatus(v.userId, Status.ONLINE, true);
        // remove states from maps
        if (clientUserMap[v.userId]) clientUserMap[v.userId] = undefined;
        if (v.client && clientGameMap[v.client.id])
          clientGameMap[v.client.id] = undefined;
      });

      // remove gamestate
      states[state.gameId] = undefined;
    });
    return gameId;
  }

  joinGame(userId: string, gameId: string): { gameId: string } | false {
    const game = states[gameId];
    if (!game) return false;

    // check if client is already ingame
    const isUserAlreadyJoined = !!clientUserMap[userId];
    if (isUserAlreadyJoined) return;

    try {
      game.addUser(userId);
    } catch (err) {
      return false;
    }
    return {
      gameId: gameId,
    };
  }

  onDisconnect(client: Socket) {
    const gameId = clientGameMap[client.id];
    if (!gameId) return;

    const game = states[gameId];
    if (game) game.disconnectClient(client);
  }

  _convertMatchToGame(match: IMatch, users: UserEntity[]): IGameState {
    const state = createGameState(match.id);
    const players = [
      {
        userId: match.user_acpt,
        name: users.find((v) => v.id === match.user_acpt)?.name || null,
        score: match.user_acpt_score,
      },
      {
        userId: match.user_req,
        name: users.find((v) => v.id === match.user_req)?.name || null,
        score: match.user_req_score,
      },
    ];
    return {
      ...state,
      amountOfSeconds: match.time_elapsed,
      pastGame: true,
      players: state.players.map((v, i) => ({
        ...v,
        ...players[i],
      })) as [IPlayer, IPlayer],
      settings: {
        ...state.settings,
        addons: match.addons.split(';'),
      },
      endReason: EndReasons.FAIRFIGHT,
      winner: match.winner_id,
    };
  }

  async readyEvent(
    client: Socket,
    gameId: string,
  ): Promise<string | { match: any }> {
    const game = states[gameId];
    if (!game) {
      const match = await this.matchService.findMatch(gameId);
      if (!match) return 'notfound';
      const users = await this.userRepository.findByIds(
        [match.user_acpt, match.user_req],
        {
          relations: [],
        },
      );
      return {
        match: this._convertMatchToGame(match, users),
      };
    }

    client.join(gameId);
    const res = await game.setReady(client, this.userService);
    if (res === 'notregistered') {
      return res;
    }

    if (res === 'playing') {
      setUserStatus(client.auth, Status.INGAME, true);
      clientUserMap[client.auth] = gameId;
    }
    clientGameMap[client.id] = gameId;
    return res;
  }

  subscribeEvent(client: Socket, gameId: string) {
    const game = states[gameId];
    if (!game) {
      client.emit('gameSubscribeReturn', {
        gameId: gameId,
        status: 'finished',
      });
      return;
    }

    game.subscribeClient(client);
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
