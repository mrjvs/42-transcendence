import { IGameState, IPlayer } from './Constants';

const padding = 100;

const trailData: any[] = [];

function getPlayerColor(index: number) {
  if (index == 0) return '#4370D8';
  return '#E64D90';
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
  return ctx;
}

function renderPlayer(
  ctx: CanvasRenderingContext2D,
  playerCtx: IPlayer,
  playerId: number,
) {
  ctx.fillStyle = getPlayerColor(playerId);
  ctx.shadowBlur = 8;
  ctx.shadowColor = getPlayerColor(playerId);
  roundRect(
    ctx,
    playerCtx.x + padding,
    playerCtx.y,
    playerCtx.width,
    playerCtx.height,
    5,
  );
}

export function drawGame(
  gameState: IGameState | null,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D | null,
) {
  if (!context) return;
  const gameWidth = gameState?.settings.fieldWidth || 1920;
  const gameHeight = gameState?.settings.fieldHeight || 1080;
  const gameWidthPadded = gameWidth + padding * 2;

  const rect = (canvas.parentNode as any)?.getBoundingClientRect();
  if (rect) {
    const maxW = rect.width;
    const maxH = 16 * 25;

    let calcWidth = maxW;
    let calcHeight = (9 / 16) * maxW;

    if (calcHeight > maxH) {
      calcHeight = maxH;
      calcWidth = (16 / 9) * maxH;
    }

    if (canvas.width !== calcWidth || canvas.height !== calcHeight) {
      canvas.width = calcWidth;
      canvas.height = calcHeight;
    }
  }

  if (!gameState) return;

  // draw background
  context.setTransform(
    gameWidth / gameState?.settings.fieldWidth,
    0,
    0,
    gameHeight / gameState?.settings.fieldHeight,
    0,
    0,
  );
  context.fillStyle = 'blue';
  context.fillRect(0, 0, gameWidth, gameHeight);

  // scale/shrink game to canvas size
  context.setTransform(
    canvas.width / gameWidthPadded,
    0,
    0,
    canvas.height / gameHeight,
    0,
    0,
  );

  // Draw background
  context.fillStyle = '#181D2E';
  context.fillRect(0, 0, gameWidthPadded, gameHeight);
  context.fillStyle = '#1A1F31';
  context.fillRect(padding, 0, gameWidth, gameHeight);

  // Draw net
  net(gameState, context);
  // Draw left player
  if (gameState.players[0].special === true)
    playerZeroSpecial(gameState, context);
  else {
    renderPlayer(context, gameState.players[0], 0);
  }
  // Draw right player
  if (gameState.players[1].special === true)
    playerOneSpecial(gameState, context);
  else {
    renderPlayer(context, gameState.players[1], 1);
  }
  // Draw ball
  ball(gameState, context);
}

function ball(gameState: IGameState, context: CanvasRenderingContext2D) {
  context.shadowBlur = 0;
  trailData.push([gameState.ball.x + padding, gameState.ball.y]);
  if (trailData.length > 15) {
    trailData.shift();
  }
  trailData.forEach((v, i, a) => {
    const ratio = (i + 1) / a.length;
    let radius = gameState.ball.radius * 0.75;
    context.fillStyle = `rgba(77, 87, 128, ${ratio * 0.1})`;
    if (i == a.length - 1) {
      context.fillStyle = '#B5C1F9';
      radius = gameState.ball.radius;
      context.shadowBlur = 15;
      context.shadowColor = '#6378D9';
    }
    context.beginPath();
    context.arc(v[0], v[1], radius, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
  });
  context.shadowBlur = 0;
}

function net(gameState: IGameState, context: CanvasRenderingContext2D) {
  const width = 1;
  const net: any = {
    x: Math.floor(gameState.settings.fieldWidth / 2 - width / 2),
    y: 1,
    width,
    height: 30,
    color: '#505771',
  };
  context.fillStyle = net.color;
  for (let i = 1; i <= gameState.settings.fieldHeight; i += 50) {
    context.fillRect(net.x + padding, net.y + i, net.width, net.height);
  }
}

function playerZeroSpecial(
  gameState: IGameState,
  context: CanvasRenderingContext2D,
) {
  context.fillStyle = 'RED';
  context.fillRect(
    gameState.players[0].x + (gameState.players[0].width / 3) * 2,
    gameState.players[0].y,
    gameState.players[0].width / 3,
    gameState.players[0].height,
  );
  context.fillStyle = 'YELLOW';
  context.fillRect(
    gameState.players[0].x,
    gameState.players[0].y,
    gameState.players[0].width,
    gameState.players[0].height / 5,
  );
  context.fillRect(
    gameState.players[0].x,
    gameState.players[0].y + (gameState.players[0].height / 5) * 4,
    gameState.players[0].width,
    gameState.players[0].height / 5,
  );
}

function playerOneSpecial(
  gameState: IGameState,
  context: CanvasRenderingContext2D,
) {
  context.fillStyle = 'RED';
  context.fillRect(
    gameState.players[1].x,
    gameState.players[1].y,
    gameState.players[1].width / 3,
    gameState.players[1].height,
  );
  context.fillStyle = 'YELLOW';
  context.fillRect(
    gameState.players[1].x,
    gameState.players[1].y,
    gameState.players[1].width,
    gameState.players[1].width / 5,
  );
  context.fillRect(
    gameState.players[1].x,
    gameState.players[1].y + (gameState.players[1].height / 5) * 4,
    gameState.players[1].width,
    gameState.players[1].width / 5,
  );
}
