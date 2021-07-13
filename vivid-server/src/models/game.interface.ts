export interface IPlayer {
  userId: string;
  playerNumber: number;
  x: number;
  y: number;
  score: number;
  move: number;
  spacebar: number;
  addOnPoints: number;
  trampoline: boolean;
  ready: boolean;
}

export interface IBall {
  x: number;
  y: number;
  radius: number;
  speed: number;
  velocityX: number;
  velocityY: number;
  color: string;
}

export interface INet {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface ISettings {
  controls: string;
  multiPlayer: boolean;
  addon: string;
}

export interface IGameState {
  gameId: string;
  settings: ISettings;
  players: IPlayer[];
  ball: IBall;
  twoPlayers: boolean;
  computerLevel: number;
  increaseSpeedAfterContact: number;
  playerWidth: number;
  playerHeight: number;
  playerColor: string;
  addOnReady: number;
}
