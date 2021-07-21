import { IGameState } from '~/models/game.interface';

export function createGameState(gameId: string): IGameState {
  const initPlayer = {
    client: null,
    userId: null,
    ready: false,
    score: 0,
    width: 0.02,
    height: 0.3,

    move: 0,
    spacebar: 0,
    shoot: 0,

    addOnPoints: 0,
    special: false,
  };

  return {
    gameId,
    settings: {
      addons: [],
    },
    players: [
      {
        ...initPlayer,
        x: 0,
        y: 0.5,
      },
      {
        ...initPlayer,
        x: 0.98,
        y: 0.5,
      },
    ],
    ball: {
      x: 0.5,
      y: 0.5,
      radius: 0.03,
      speed: 0.01,
      velocityX: 0.005,
      velocityY: 0.005,
    },

    finished: false,
    increaseSpeedAfterContact: 0.0001,
  };
}
