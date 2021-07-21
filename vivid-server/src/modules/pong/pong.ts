import { IPlayer } from '@/game.interface';
import { IGameState } from '@/game.interface';

// time to shoot in frames
let time_to_shoot = 100;

function resetBall(state: IGameState) {
  state.ball.x = 0.5;
  state.ball.y = 0.5;
  state.ball.speed = 0.01;
  state.ball.velocityX = 0.005;
  state.ball.velocityY = 0.005;
  state.ball.velocityX = -state.ball.velocityX;
  state.addOnReady = 0;
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

function updateBallLocation(state: IGameState): IPlayer | null {
  // Check for wall hit
  if (
    (state.ball.y + state.ball.radius > 1.0 && state.ball.velocityY > 0.0) ||
    (state.ball.y - state.ball.radius < 0.0 && state.ball.velocityY < 0.0)
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

  // check for addon 'rocket'
  if (
    state.settings.addon === 'trampoline' ||
    state.settings.addon === 'sticky'
  ) {
    if (
      attackingPlayer.spacebar &&
      attackingPlayer.special === false &&
      attackingPlayer.addOnPoints > 0
    ) {
      attackingPlayer.special = true;
      attackingPlayer.addOnPoints -= 1;
    }
    if (
      defendingPlayer.spacebar &&
      defendingPlayer.special === false &&
      defendingPlayer.addOnPoints > 0
    ) {
      defendingPlayer.special = true;
      defendingPlayer.addOnPoints -= 1;
    }
  }

  // Check for pad collision and change ball direction
  if (
    collision(defendingPlayer, state) &&
    !(state.addOnReady && state.settings.addon === 'sticky')
  ) {
    // an special move (addon) can only be used once every collision
    if (
      state.settings.addon === 'trampoline' &&
      defendingPlayer.special === true
    ) {
      state.ball.speed += 0.01;
      defendingPlayer.special = false;
      state.addOnReady += 1;
    } else if (state.addOnReady >= 1 && state.settings.addon === 'trampoline') {
      state.ball.speed -= 0.01 * state.addOnReady;
      state.addOnReady = 0;
    }

    if (state.settings.addon === 'sticky' && defendingPlayer.special === true) {
      state.addOnReady = 1;
    }

    const collidePoint =
      (state.ball.y - (defendingPlayer.y + state.playerHeight / 2)) /
      (state.playerHeight / 2);
    const angleRad = collidePoint * (Math.PI / 4);
    const direction = state.ball.x < 0.5 ? 1 : -1;
    state.ball.velocityX = Math.cos(angleRad) * state.ball.speed * direction;
    state.ball.velocityY = Math.sin(angleRad) * state.ball.speed;
    state.ball.speed += state.increaseSpeedAfterContact;

    // adding special at random 1 in 5 change
    if (Math.floor(Math.random() * 5) == 0 && defendingPlayer.addOnPoints < 3)
      defendingPlayer.addOnPoints += 1;
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
  if (state.settings.addon === 'sticky' && state.addOnReady === 1) {
    time_to_shoot -= 1;
    if (defendingPlayer.shoot === 1 || time_to_shoot <= 0) {
      state.ball.x += state.ball.velocityX;
      state.ball.y += state.ball.velocityY;
      state.addOnReady = 0;
      defendingPlayer.special = false;
      time_to_shoot = 100;
    } else {
      if (
        defendingPlayer.y + state.playerHeight + defendingPlayer.move <= 1 &&
        defendingPlayer.y + defendingPlayer.move >= 0
      ) {
        state.ball.y += defendingPlayer.move;
      }
    }
  } else {
    state.ball.x += state.ball.velocityX;
    state.ball.y += state.ball.velocityY;
  }
  return null;
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
  if (state.addOnReady === 1 && state.settings.addon === 'sticky') {
    if (
      state.players[0].y + state.playerHeight + state.players[0].move <= 1 &&
      state.players[0].y + state.players[0].move >= 0
    )
      state.players[0].y += state.players[0].move;
    if (
      state.players[1].y + state.playerHeight + state.players[1].move <= 1 &&
      state.players[1].y + state.players[1].move >= 0
    )
      state.players[1].y += moveRightPlayer(state);
  } else {
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
}

// Game loop
export function gameLoop(gameState: IGameState) {
  updatePlayerLocation(gameState);
  return updateBallLocation(gameState);
}
