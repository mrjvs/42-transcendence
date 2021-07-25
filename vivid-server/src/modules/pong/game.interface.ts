export interface IPlayer {
  // connection data
  client: any | null;
  userId: string | null;
  name: string | null;
  ready: boolean;

  // game state
  score: number;
  speed: number;
  extraSpeed: number;

  // render variables
  width: number;
  extraHeight: number;
  height: number;
  x: number;
  y: number;

  // control states
  holdingUp: number;
  holdingDown: number;
  lastPressed: null | 'up' | 'down';
  move: number;
  spacebar: number;

  // addons
  addonUsageCountdown: number; // how long to wait until you get a new addon
  addonUsageTicks: number;
  stashedAddon: string | null;
  special: boolean;
  activatedTicks: number; // how long its activated for
  activatedTicksMax: number;
  sticky: boolean;
}

export interface ISpectator {
  client?: any | null;
}

export enum EndReasons {
  RAGEQUIT = 'ragequit',
  FAIRFIGHT = 'fairfight',
  CANCELLED = 'cancelled',
}

export enum GameProgress {
  WAITING = 'waiting',
  COUNTDOWN = 'countdown',
  PLAYING = 'playing',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

export interface IGameState {
  // id for game
  gameId: string;

  // player defined settings
  settings: {
    fieldWidth: number;
    fieldHeight: number;
    addons: string[];
    ticksPerMs: number;
  };

  // player entity
  players: [IPlayer, IPlayer];

  // ball entity
  ball: {
    x: number;
    y: number;
    radius: number;
    extraRadiuses: { player: string; factor: number }[];
    extraSpeeds: { player: string; factor: number }[];
    speed: number;
    addedSpeed: number;
    velocityX: number;
    velocityY: number;
  };

  // game states
  gameProgress: GameProgress;
  spectators: ISpectator[];
  subscribers: ISpectator[];
  countdownNum: number;
  countdownTicks: number;
  endReason: EndReasons | null;
  pastGame: boolean;

  amountOfSeconds: number;

  // game ball speed get's progressively faster
  increaseSpeedAfterContact: number;

  // game winner
  winner: string | null;
}
