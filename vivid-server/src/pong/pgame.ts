// import { GameState } from '../components/Canvas';
// import { Draw } from './Draw';
//////////////////////////////////////////////////////////////

import { GameState } from '../../../vivid-client/src/views/Game/game';

export interface IPlayer {
  y: number;
  x: number;
  score: number;
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

// ////////////////////////////////////////////////////////////

// export class Pong {
//   // context: CanvasRenderingContext2D;
//   // canvas: HTMLCanvasElement;
//   // left_player: IPlayer;
//   // right_player: IPlayer;
//   // ball: IBall;
//   // move_left_player: number;
//   // move_right_player: number;
//   // increase_speed_after_contact: number;
//   // computer_level: number;
//   // two_players: boolean;
//   // framePerSecond: number;
//   // draw: Draw;
//   // player_width: number;
//   // player_height: number;
//   // player_color: string;

//   constructor() {
//     // this.context = context;
//     // this.canvas = canvas;
//     // Game settings
//     // this.two_players = false;
//     // this.computer_level = 0.01;
//     // this.increase_speed_after_contact = 0.2;
//     // this.framePerSecond = 100;
//     // this.player_width = this.canvas.height / 50;
//     // this.player_height = this.canvas.height / 4;
//     // this.player_color = 'PURPLE';
//     // this.draw = new Draw(this.context, this.canvas);
//     // this.move_left_player = 0;
//     // this.move_right_player = 0;
//     // this.left_player = {
//     //   y: this.canvas.height / 2 - 100 / 2,
//     //   x: 0,
//     //   score: 0,
//     // };
//     // this.right_player = {
//     //   y: this.canvas.height / 2 - 100 / 2,
//     //   x: this.canvas.width - this.player_width,
//     //   score: 0,
//     // };
//     // this.ball = {
//     //   x: this.canvas.width / 2,
//     //   y: this.canvas.height / 2,
//     //   radius: this.canvas.width / 50,
//     //   speed: 2,
//     //   velocityX: 2,
//     //   velocityY: 2,
//     //   color: 'ORANGE',
//     // };
//   }

//   // Set event listener for key control
//   // playWithKeys() {
//   //   window.addEventListener(
//   //     'keydown',
//   //     (event) => {
//   //       switch (event.key) {
//   //         case 'w':
//   //           this.move_left_player = -5;
//   //           break;
//   //         case 's':
//   //           this.move_left_player = 5;
//   //           break;
//   //         case 'ArrowUp':
//   //           this.move_right_player = -5;
//   //           break;
//   //         case 'ArrowDown':
//   //           this.move_right_player = 5;
//   //           break;
//   //       }
//   //     },
//   //     true,
//   //   );
//   //   window.addEventListener(
//   //     'keyup',
//   //     (event) => {
//   //       switch (event.key) {
//   //         case 'w':
//   //           this.move_left_player = 0;
//   //           break;
//   //         case 's':
//   //           this.move_left_player = 0;
//   //           break;
//   //         case 'ArrowUp':
//   //           this.move_right_player = 0;
//   //           break;
//   //         case 'ArrowDown':
//   //           this.move_right_player = 0;
//   //           break;
//   //       }
//   //     },
//   //     true,
//   //   );
//   // }

//   // Set event listener for mouse control
//   // playWithMouse() {
//   //   this.canvas.addEventListener('mousemove', (event: MouseEvent) => {
//   //     const rect = this.canvas.getBoundingClientRect();
//   //     this.left_player.y = event.clientY - rect.top - this.player_height / 2;
//   //   });
//   // }

// Calculate if the ball hit a pad
function collision(player: IPlayer, gameState: GameState) {
  const playerTop = player.y;
  const playerBottom = player.y + gameState.player_height;
  const playerLeft = player.x;
  const playerRight = player.x + gameState.player_width;
  const ballTop = gameState.ball.y - gameState.ball.radius;
  const ballBottom = gameState.ball.y + gameState.ball.radius;
  const ballLeft = gameState.ball.x - gameState.ball.radius;
  const ballRight = gameState.ball.x + gameState.ball.radius;
  return (
    ballBottom > playerTop &&
    ballTop < playerBottom &&
    ballRight > playerLeft &&
    ballLeft < playerRight
  );
}

function moveRightPlayer(state: GameState) {
  // if (this.two_players) {
  //   return this.move_right_player;
  // }
  // If right player is a bot
  return (
    (state.ball.y - (state.right_player.y + state.player_height / 2)) *
    state.computer_level
  );
}

function resetBall(state: GameState) {
  state.ball.x = state.canvas.width / 2;
  state.ball.y = state.canvas.height / 2;
  state.ball.speed = 2;
  state.ball.velocityX = 2;
  state.ball.velocityY = 2;
  state.ball.velocityX = -state.ball.velocityX;
}

function updateBallLocation(state: GameState) {
  // Check for wall hit
  if (
    state.ball.y + state.ball.radius > state.canvas.height ||
    state.ball.y - state.ball.radius < 0
  )
    state.ball.velocityY = -state.ball.velocityY;

  // Check on which player's side the ball is
  const player =
    state.ball.x < state.canvas.width / 2
      ? state.left_player
      : state.right_player;

  // Check for pad collision and change ball direction
  if (collision(player, state)) {
    const collidePoint =
      (state.ball.y - (player.y + state.player_height / 2)) /
      (state.player_height / 2);
    const angleRad = collidePoint * (Math.PI / 4);
    const direction = state.ball.x < state.canvas.width / 2 ? 1 : -1;
    state.ball.velocityX = Math.cos(angleRad) * state.ball.speed * direction;
    state.ball.velocityY = Math.sin(angleRad) * state.ball.speed;
    state.ball.speed += state.increase_speed_after_contact;
  }

  // Check for goal and reset ball
  if (
    state.ball.x - state.ball.radius < 0 ||
    state.ball.x + state.ball.radius > state.canvas.width
  ) {
    player.score += 1;
    // TODO end game
    if (player.score === 10) return player;
    resetBall(state);
  }

  // Update ball location
  state.ball.x += state.ball.velocityX;
  state.ball.y += state.ball.velocityY;
}

function updatePlayerLocation(state: GameState) {
  state.left_player.y += state.move_left_player;
  state.right_player.y += moveRightPlayer(state);
}

//   render(state: GameState) {
//     if (!state || !state.draw) return;
//     state.draw.background();
//     // Draw scores
//     state.draw.scores(
//       state.right_player.score.toString(),
//       state.left_player.score.toString(),
//     );
//     // Draw net
//     state.draw.net(state.canvas.height);
//     // Draw left player
//     state.draw.pads(
//       state.left_player.x,
//       state.left_player.y,
//       state.player_width,
//       state.player_height,
//       state.player_color,
//     );
//     // Draw right player
//     state.draw.pads(
//       state.right_player.x,
//       state.right_player.y,
//       state.player_width,
//       state.player_height,
//       state.player_color,
//     );
//     // Draw ball
//     state.draw.ball(
//       state.ball.x,
//       state.ball.y,
//       state.ball.radius,
//       state.ball.color,
//     );
//   }

// Game loop
export function gameLoop(gameState: GameState) {
  const winner = updateBallLocation(gameState);
  updatePlayerLocation(gameState);
  if (winner) {
    if (winner === gameState.left_player) return 1;
    else return 2;
  }
  return 0;
}

// }

// ////////////////////////////////////////////////////////////

// // export function main() {
// //   const game = new Pong();

// //   // Set game options
// //   // game.two_player = true;
// //   // game.playWithMouse();
// //   game.playWithKeys();

// //   // Start game
// //   game.start();
// // }

// ////////////////////////////////////////////////////////////
