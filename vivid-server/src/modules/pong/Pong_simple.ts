import { IPlayer } from '@/game.interface';
import { IGameState } from '@/game.interface';

function resetBall(state: IGameState) {
  state.ball.x = 0.5;
  state.ball.y = 0.5;
  state.ball.speed = 0.01;
  state.ball.velocityX = 0.01;
  state.ball.velocityY = 0.01;
  state.ball.velocityX = -state.ball.velocityX;
}

// Calculate if the ball hit a pad
function collision(player: IPlayer, gameState: IGameState) {
  const playerTop = player.y;
  const playerBottom = player.y + player.height;
  const playerLeft = player.x;
  const playerRight = player.x + player.width;
  const ballTop = gameState.ball.y - gameState.ball.radius;
  const ballBottom = gameState.ball.y + gameState.ball.radius;
  const ballLeft = gameState.ball.x - gameState.ball.radius;
  const ballRight = gameState.ball.x + gameState.ball.radius;
  // TODO out of bounds check

  return (
    ballBottom > playerTop &&
    ballTop < playerBottom &&
    ballRight > playerLeft &&
    ballLeft < playerRight
  );
}

function updateBallLocation(state: IGameState): IPlayer | null {
  // Check for wall hit
  if (
    state.ball.y + state.ball.radius > 1 ||
    state.ball.y - state.ball.radius < 0
  )
    state.ball.velocityY = -state.ball.velocityY;

  // Check on which player's side the ball is
  let defendingPlayer: IPlayer;
  let attackingPlayer: IPlayer;
  if (state.ball.x < 0.5) {
    defendingPlayer = state.players[0];
    attackingPlayer = state.players[1];
  } else {
    defendingPlayer = state.players[1];
    attackingPlayer = state.players[0];
  }

  // Check for pad collision and change ball direction
  if (collision(defendingPlayer, state)) {
    const collidePoint =
      (state.ball.y - (defendingPlayer.y + defendingPlayer.height / 2)) /
      (defendingPlayer.height / 2);
    const angleRad = collidePoint * (Math.PI / 4);
    const direction = state.ball.x < 0.5 ? 1 : -1;
    state.ball.velocityX = Math.cos(angleRad) * state.ball.speed * direction;
    state.ball.velocityY = Math.sin(angleRad) * state.ball.speed;
    state.ball.speed += state.increaseSpeedAfterContact;
  }

  // Check for goal and reset ball
  if (
    state.ball.x - state.ball.radius < 0 ||
    state.ball.x + state.ball.radius > 1
  ) {
    attackingPlayer.score += 1;
    if (attackingPlayer.score === 10) return attackingPlayer;
    resetBall(state);
  }

  // Update ball location
  state.ball.x += state.ball.velocityX;
  state.ball.y += state.ball.velocityY;
  return null;
}

// Update player locations
function updatePlayerLocation(state: IGameState, playerIndex: number) {
  if (
    state.players[playerIndex].y + state.players[playerIndex].move <= 1 &&
    state.players[playerIndex].y +
      state.players[playerIndex].height +
      state.players[playerIndex].move >=
      0
  )
    state.players[playerIndex].y += state.players[playerIndex].move;
}

// Game loop
export function gameLoop(gameState: IGameState) {
  updatePlayerLocation(gameState, 0);
  updatePlayerLocation(gameState, 1);
  return updateBallLocation(gameState);
}
