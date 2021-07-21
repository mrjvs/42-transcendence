export interface IPlayer {
  // connection data
  client: any | null;
  userId: string | null;
  ready: boolean;

  // game state
  score: number;

  // render variables
  width: number;
  height: number;
  x: number;
  y: number;

  // control states
  move: number;
  spacebar: number;
  shoot: number;

  // ??
  addOnPoints: number;
  special: boolean;
}

export interface IGameState {
  // id for game
  gameId: string;

  // player defined settings
  settings: {
    addons: string[];
  };

  // player entity
  players: [IPlayer, IPlayer];

  // ball entity
  ball: {
    x: number;
    y: number;
    radius: number;
    speed: number; // ??
    velocityX: number;
    velocityY: number;
  };

  // ???
  increaseSpeedAfterContact: number;
}
