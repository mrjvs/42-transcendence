export interface IPlayer {
  playerNumber: number;
  x: number;
  y: number;
  score: number;
  move: number;
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

export interface IGameState {
  players: IPlayer[];
  ball: IBall;
  two_players: boolean;
  computerLevel: number;
  increaseSpeedAfterContact: number;
  playerWidth: number;
  playerHeight: number;
  playerColor: string;
}
