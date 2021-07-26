import { IPlayer } from '$/pong/game.interface';
import { IGameState } from '$/pong/game.interface';

const constants = {
  ballStartSpeed: 20,
  ballStartVelocity: 0.01,
  addons: {
    bigpad: {
      duration: 500,
    },
    bigball: {
      duration: 700,
    },
    fastball: {
      duration: 350,
    },
    fastpad: {
      duration: 500,
    },
    sticky: {
      duration: 200,
    },
  },
  addonResetTime: 15,
};

export function resetField(state: IGameState) {
  resetBall(state);
  state.players[0].x = 0;
  state.players[0].y =
    state.settings.fieldHeight / 2 - state.players[0].height / 2;

  state.players[1].x = state.settings.fieldWidth - state.players[1].width;
  state.players[1].y =
    state.settings.fieldHeight / 2 - state.players[1].height / 2;

  resetAddonUsage(state.players[1]);
  resetAddonUsage(state.players[0]);
}

function resetAddonUsage(player: IPlayer) {
  player.addonUsageCountdown = constants.addonResetTime;
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
  state.ball.addedSpeed = 0;
}

function runAddon(gameState: IGameState, player: IPlayer) {
  if (player.stashedAddon === 'bigpad') {
    player.extraHeight = 60;
    player.y -= Math.floor(player.extraHeight / 2);
  } else if (player.stashedAddon === 'bigball') {
    gameState.ball.extraRadiuses.push({ player: player.userId, factor: 1.5 });
  } else if (player.stashedAddon === 'fastball') {
    gameState.ball.extraSpeeds.push({ player: player.userId, factor: 1.5 });
  } else if (player.stashedAddon === 'fastpad') {
    player.extraSpeed = 10;
  } else if (player.stashedAddon === 'sticky') {
    player.sticky = true;
  }
}

function revertAddon(gameState: IGameState, player: IPlayer) {
  if (player.stashedAddon === 'bigpad') {
    player.y += Math.floor(player.extraHeight / 2);
    player.extraHeight = 0;
  } else if (player.stashedAddon === 'bigball')
    gameState.ball.extraRadiuses = gameState.ball.extraRadiuses.filter(
      (v) => v.player !== player.userId,
    );
  else if (player.stashedAddon === 'fastball')
    gameState.ball.extraSpeeds = gameState.ball.extraSpeeds.filter(
      (v) => v.player !== player.userId,
    );
  else if (player.stashedAddon === 'fastpad') player.extraSpeed = 0;
  else if (player.stashedAddon === 'sticky') {
    gameState.ball.speed =
      constants.ballStartSpeed +
      gameState.increaseSpeedAfterContact * gameState.ball.addedSpeed;
    player.sticky = false;
  }
}

function addonTick(gameState: IGameState) {
  for (let i = 0; i < gameState.players.length; i++) {
    // countdown addonusage
    if (gameState.players[i].addonUsageCountdown > 0)
      gameState.players[i].addonUsageTicks -= 1;
    if (gameState.players[i].addonUsageTicks <= 0) {
      gameState.players[i].addonUsageCountdown -= 1;
      gameState.players[i].addonUsageTicks =
        1000 / gameState.settings.ticksPerMs;
      if (gameState.players[i].addonUsageCountdown === 0) {
        // countdown to zero, give new addon
        gameState.players[i].stashedAddon =
          gameState.settings.addons[
            Math.floor(Math.random() * gameState.settings.addons.length)
          ];
      }
    }

    // countdown activated
    if (gameState.players[i].activatedTicks > 0) {
      gameState.players[i].activatedTicks -= 1;
      if (gameState.players[i].activatedTicks === 0) {
        gameState.players[i].special = false;
        resetAddonUsage(gameState.players[i]);
        revertAddon(gameState, gameState.players[i]);
        gameState.players[i].stashedAddon = null;
      }
    }

    // keyboard press
    if (
      gameState.players[i].spacebar === 1 &&
      gameState.players[i].stashedAddon &&
      !gameState.players[i].special
    ) {
      gameState.players[i].spacebar = 2;
      gameState.players[i].special = true;
      gameState.players[i].activatedTicksMax =
        constants.addons[gameState.players[i].stashedAddon].duration;
      gameState.players[i].activatedTicks =
        gameState.players[i].activatedTicksMax;
      runAddon(gameState, gameState.players[i]);
    } else if (
      gameState.players[i].spacebar === 1 &&
      gameState.players[i].stashedAddon === 'sticky' &&
      gameState.players[i].special
    ) {
      gameState.players[i].activatedTicks = 0;
      gameState.players[i].special = false;
      resetAddonUsage(gameState.players[i]);
      revertAddon(gameState, gameState.players[i]);
      gameState.players[i].stashedAddon = null;
      gameState.players[i].spacebar = 0;
    } else if (gameState.players[i].spacebar === 1) {
      gameState.players[i].spacebar = 0;
    }
  }
}

// Calculate if the ball hit a pad
function collision(player: IPlayer, gameState: IGameState, radius: number) {
  const playerTop = player.y;
  const playerBottom = player.y + player.height + player.extraHeight;
  const playerLeft = player.x;
  const playerRight = player.x + player.width;
  const ballTop = gameState.ball.y - radius;
  const ballBottom = gameState.ball.y + radius;
  const ballLeft = gameState.ball.x - radius;
  const ballRight = gameState.ball.x + radius;

  return (
    ballBottom > playerTop &&
    ballTop < playerBottom &&
    ballRight > playerLeft &&
    ballLeft < playerRight
  );
}

function updateBallLocation(state: IGameState): string | null {
  // radius
  const radius = state.ball.extraRadiuses.reduce(
    (a, v) => a * v.factor,
    state.ball.radius,
  );

  // Update ball location
  const speed = state.ball.extraSpeeds.reduce(
    (a, v) => a * v.factor,
    state.ball.speed,
  );
  state.ball.x += state.ball.velocityX * speed;
  state.ball.y += state.ball.velocityY * speed;

  // Check for top/bottom wall hit
  if (
    (state.ball.velocityY > 0 &&
      state.ball.y + radius >= state.settings.fieldHeight) ||
    (state.ball.velocityY < 0 && state.ball.y - radius <= 0)
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

  // change ball y position when 'sticky' addon is active
  if (state.ball.speed === 0 && defendingPlayer.sticky) {
    state.ball.y +=
      defendingPlayer.move *
      (defendingPlayer.speed + defendingPlayer.extraSpeed);
  }

  // Check for pad collision and change ball direction
  if (collision(defendingPlayer, state, radius)) {
    const collidePoint =
      (state.ball.y -
        (defendingPlayer.y +
          (defendingPlayer.height + defendingPlayer.extraHeight) / 2)) /
      ((defendingPlayer.height + defendingPlayer.extraHeight) / 2);
    const angleRad = collidePoint * (Math.PI / 4);
    const direction = state.ball.x < state.settings.fieldWidth / 2 ? 1 : -1;
    state.ball.velocityX = Math.cos(angleRad) * direction;
    state.ball.velocityY = Math.sin(angleRad);

    if (defendingPlayer.sticky) {
      state.ball.speed = 0;
    } else {
      state.ball.speed += state.increaseSpeedAfterContact;
      state.ball.addedSpeed += 1;
    }

    // move ball position outside of pad
    if (state.ball.x < state.settings.fieldWidth / 2)
      state.ball.x = defendingPlayer.width + radius;
    else state.ball.x = defendingPlayer.x - radius;
  }

  // Check for goal and reset ball
  if (
    state.ball.x - radius <= 0 ||
    state.ball.x + radius >= state.settings.fieldWidth
  ) {
    attackingPlayer.score += 1;
    if (attackingPlayer.score === 11) {
      return attackingPlayer.userId;
    }
    resetBall(state);
    return null;
  }

  // move out of wall if inside the wall
  if (state.ball.x - radius < 0) state.ball.x = radius;
  if (state.ball.x + radius > state.settings.fieldWidth)
    state.ball.x = state.settings.fieldWidth - radius;
  if (state.ball.y - radius < 0) state.ball.y = radius;
  if (state.ball.y + radius > state.settings.fieldHeight)
    state.ball.y = state.settings.fieldHeight - radius;
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
    state.players[playerIndex].move *
    (state.players[playerIndex].speed + state.players[playerIndex].extraSpeed);
  // if stuck in wall, move out of it (bottom)
  if (state.players[playerIndex].y + move < 0) state.players[playerIndex].y = 0;
  // if stuck in wall, move out of it (top)
  else if (
    state.players[playerIndex].y +
      (state.players[playerIndex].height +
        state.players[playerIndex].extraHeight) +
      move >
    state.settings.fieldHeight
  )
    state.players[playerIndex].y =
      state.settings.fieldHeight -
      (state.players[playerIndex].height +
        state.players[playerIndex].extraHeight);
  // move if not stuck
  else state.players[playerIndex].y += move;
}

// Game loop
export function gameLoop(gameState: IGameState): string | null {
  // handle addon cooldowns + spacebar input
  addonTick(gameState);

  // move players
  updatePlayerLocation(gameState, 0);
  updatePlayerLocation(gameState, 1);

  // move ball
  const winner = updateBallLocation(gameState);

  // set spacebar input back
  if (gameState.players[0].spacebar == 2) gameState.players[0].spacebar = 0;
  if (gameState.players[1].spacebar == 2) gameState.players[1].spacebar = 0;
  return winner;
}
