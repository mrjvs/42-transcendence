import { IPlayer } from '@/game.interface';
import { IGameState } from '@/game.interface';

const constants = {
  ballStartSpeed: 20,
  ballStartVelocity: 0.01,
};

export function resetField(state: IGameState) {
  resetBall(state);
  state.players[0].x = 0;
  state.players[0].y =
    state.settings.fieldHeight / 2 - state.players[0].height / 2;

  state.players[1].x = state.settings.fieldWidth - state.players[1].width;
  state.players[1].y =
    state.settings.fieldHeight / 2 - state.players[1].height / 2;
}

function resetBall(state: IGameState) {
  state.ball.x = state.settings.fieldWidth / 2;
  state.ball.y = state.settings.fieldHeight / 2;
  state.ball.speed = constants.ballStartSpeed;
  const randomDirection = Math.floor(Math.random() * 4);
  const degrees = 45 + randomDirection * 90;
  const angleRad = degrees * (Math.PI / 180);
  state.ball.velocityX = Math.cos(angleRad);
  state.ball.velocityY = Math.sin(angleRad);
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

  return (
    ballBottom > playerTop &&
    ballTop < playerBottom &&
    ballRight > playerLeft &&
    ballLeft < playerRight
  );
}

function updateBallLocation(state: IGameState): string | null {
  // Update ball location
  state.ball.x += state.ball.velocityX * state.ball.speed;
  state.ball.y += state.ball.velocityY * state.ball.speed;

  // Check for top/bottom wall hit
  if (
    (state.ball.velocityY > 0 &&
      state.ball.y + state.ball.radius >= state.settings.fieldHeight) ||
    (state.ball.velocityY < 0 && state.ball.y - state.ball.radius <= 0)
  ) {
    state.ball.velocityY = -state.ball.velocityY;
  }

  // Check on which player's side the ball is
  let defendingPlayer: IPlayer;
  let attackingPlayer: IPlayer;
  if (state.ball.x < state.settings.fieldWidth / 2) {
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
    const oldDirection = state.ball.velocityX;
    const angleRad = collidePoint * (Math.PI / 4);
    const direction = state.ball.x < state.settings.fieldWidth / 2 ? 1 : -1;
    state.ball.velocityX = Math.cos(angleRad) * direction;
    state.ball.velocityY = Math.sin(angleRad);
    state.ball.speed += state.increaseSpeedAfterContact;

    // move ball position outside of pad
    if (oldDirection < 0)
      state.ball.x = defendingPlayer.width + state.ball.radius;
    else state.ball.x = defendingPlayer.x - state.ball.radius;
  }

  // Check for goal and reset ball
  if (
    state.ball.x - state.ball.radius <= 0 ||
    state.ball.x + state.ball.radius >= state.settings.fieldWidth
  ) {
    attackingPlayer.score += 1;
    if (attackingPlayer.score === 11) {
      return attackingPlayer.userId;
    }
    resetBall(state);
    return null;
  }

  // move out of wall if inside the wall
  if (state.ball.x - state.ball.radius < 0) state.ball.x = state.ball.radius;
  if (state.ball.x + state.ball.radius > state.settings.fieldWidth)
    state.ball.x = state.settings.fieldWidth - state.ball.radius;
  if (state.ball.y - state.ball.radius < 0) state.ball.y = state.ball.radius;
  if (state.ball.y + state.ball.radius > state.settings.fieldHeight)
    state.ball.y = state.settings.fieldHeight - state.ball.radius;
  return null;
}

// Update player locations
function updatePlayerLocation(state: IGameState, playerIndex: number) {
  state.players[playerIndex].move =
    state.players[playerIndex].holdingUp &&
    state.players[playerIndex].holdingDown
      ? state.players[playerIndex].lastPressed === 'up'
        ? -1
        : 1
      : state.players[playerIndex].holdingDown -
        state.players[playerIndex].holdingUp;
  const move =
    state.players[playerIndex].move * state.players[playerIndex].speed;
  // if stuck in wall, move out of it (bottom)
  if (state.players[playerIndex].y + move < 0) state.players[playerIndex].y = 0;
  // if stuck in wall, move out of it (top)
  else if (
    state.players[playerIndex].y + state.players[playerIndex].height + move >
    state.settings.fieldHeight
  )
    state.players[playerIndex].y =
      state.settings.fieldHeight - state.players[playerIndex].height;
  // move if not stuck
  else state.players[playerIndex].y += move;
}

// Game loop
export function gameLoop(gameState: IGameState): string | null {
  updatePlayerLocation(gameState, 0);
  updatePlayerLocation(gameState, 1);
  return updateBallLocation(gameState);
}
