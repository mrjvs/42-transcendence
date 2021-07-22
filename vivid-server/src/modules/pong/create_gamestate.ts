import { GameProgress, IGameState } from '~/models/game.interface';

export function createGameState(gameId: string): IGameState {
  const initPlayer = {
    client: null,
    userId: null,
    name: null,
    ready: false,
    score: 0,
    width: 20,
    height: 160,
    speed: 20,

    holdingUp: 0,
    holdingDown: 0,
    lastPressed: null,
    move: 0,
    spacebar: 0,
    shoot: 0,

    addOnPoints: 0,
    special: false,
  };
  const fps = 1000 / 60;

  return {
    gameId,
    settings: {
      fieldWidth: 1920,
      fieldHeight: 1080,
      addons: [],
      ticksPerMs: fps,
    },
    players: [
      {
        ...initPlayer,
        x: 0,
        y: 0,
      },
      {
        ...initPlayer,
        x: 0,
        y: 0,
      },
    ],
    ball: {
      radius: 15,
      x: 0,
      y: 0,
      speed: 0,
      velocityX: 0,
      velocityY: 0,
    },

    gameProgress: GameProgress.WAITING,
    spectators: [],
    countdownNum: 3,
    countdownTicks: fps,
    increaseSpeedAfterContact: 1,
    endReason: null,
    winner: null,
    pastGame: false,
    amoutOfSeconds: 0,
  };
}
