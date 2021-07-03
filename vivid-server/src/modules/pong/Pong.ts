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
  const playerBottom = player.y + gameState.playerHeight;
  const playerLeft = player.x;
  const playerRight = player.x + gameState.playerWidth;
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

function updateBallLocation(state: IGameState): number {
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
      (state.ball.y - (defendingPlayer.y + state.playerHeight / 2)) /
      (state.playerHeight / 2);
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
    if (attackingPlayer.score === 10) return attackingPlayer.playerNumber;
    resetBall(state);
  }

  // Update ball location
  state.ball.x += state.ball.velocityX;
  state.ball.y += state.ball.velocityY;
  return 0;
}

function moveRightPlayer(state: IGameState) {
  if (state.twoPlayers) {
    return state.players[1].move;
  }
  // If right player is a bot
  return (
    (state.ball.y - (state.players[1].y + state.playerHeight / 2)) *
    state.computerLevel
  );
}

// Update player locations
function updatePlayerLocation(state: IGameState) {
  if (
    state.players[0].y + state.players[0].move <= 1 &&
    state.players[0].y + state.playerHeight + state.players[0].move >= 0
  )
    state.players[0].y += state.players[0].move;
  if (
    state.players[1].y + state.players[1].move <= 1 &&
    state.players[1].y + state.playerHeight + state.players[1].move >= 0
  )
    state.players[1].y += moveRightPlayer(state);
}

// Game loop
export function gameLoop(gameState: IGameState) {
  updatePlayerLocation(gameState);
  return updateBallLocation(gameState);
}
