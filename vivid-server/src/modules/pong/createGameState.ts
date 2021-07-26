import { GameProgress, IGameState } from '$/pong/game.interface';

export function createGameState(
  gameId: string,
  enabledAddons: string[] = [],
): IGameState {
  const initPlayer = {
    client: null,
    userId: null,
    name: null,
    ready: false,
    score: 0,
    width: 20,
    height: 160,
    speed: 20,
    extraSpeed: 0,
    extraHeight: 0,

    holdingUp: 0,
    holdingDown: 0,
    lastPressed: null,
    move: 0,
    spacebar: 0,

    // addons
    addonUsageCountdown: 0,
    addonUsageTicks: 0,
    stashedAddon: null,
    special: false,
    activatedTicks: 0,
    activatedTicksMax: 0,
    sticky: false,
  };
  const fps = 1000 / 60;

  return {
    gameId,
    settings: {
      fieldWidth: 1920,
      fieldHeight: 1080,
      addons: [...enabledAddons],
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
      addedSpeed: 0,
      velocityX: 0,
      velocityY: 0,
      extraRadiuses: [],
      extraSpeeds: [],
    },

    gameProgress: GameProgress.WAITING,
    spectators: [],
    subscribers: [],
    countdownNum: 3,
    countdownTicks: fps,
    increaseSpeedAfterContact: 1,
    endReason: null,
    winner: null,
    pastGame: false,
    amountOfSeconds: 0,
  };
}
