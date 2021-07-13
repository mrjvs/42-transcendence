import { INet } from './Constants';
import { IGameState } from './Constants';

export function drawGame(
  gameState: IGameState,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D | null,
) {
  if (!context) return;
  // Draw background
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
  // Draw scores
  scores(gameState, canvas, context);
  // Draw net
  net(canvas, context);
  // Draw left player
  context.fillStyle = gameState.playerColor;
  context.fillRect(
    gameState.players[0].x * canvas.width,
    gameState.players[0].y * canvas.height,
    gameState.playerWidth * canvas.width,
    gameState.playerHeight * canvas.height,
  );
  // Draw right player
  context.fillRect(
    gameState.players[1].x * canvas.width,
    gameState.players[1].y * canvas.height,
    gameState.playerWidth * canvas.width,
    gameState.playerHeight * canvas.height,
  );
  // Draw ball
  ball(gameState, canvas, context);
}

function text(
  context: CanvasRenderingContext2D | null,
  text: string,
  x: number,
  y: number,
  color: string,
  font: string,
) {
  if (!context) return;
  context.fillStyle = color;
  context.font = font;
  context.fillText(text, x, y);
}

function scores(
  gameState: IGameState,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
) {
  text(
    context,
    gameState.players[0].score.toString(),
    canvas.width / 4,
    canvas.height / 5,
    'RED',
    '75px Serif',
  );
  text(
    context,
    gameState.players[1].score.toString(),
    (canvas.width / 4) * 3,
    canvas.height / 5,
    'RED',
    '75px Serif',
  );
  text(
    context,
    gameState.players[0].addOnPoints.toString(),
    canvas.width / 4,
    (canvas.height / 5) * 4,
    'RED',
    '75px Serif',
  );
  text(
    context,
    gameState.players[1].addOnPoints.toString(),
    (canvas.width / 4) * 3,
    (canvas.height / 5) * 4,
    'RED',
    '75px Serif',
  );
  text(
    context,
    gameState.ball.speed.toString(),
    (canvas.width / 4) * 2,
    (canvas.height / 5) * 2,
    'RED',
    '75px Serif',
  );
}

function ball(
  gameState: IGameState,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
) {
  context.fillStyle = gameState.ball.color;
  context.beginPath();
  context.arc(
    gameState.ball.x * canvas.width,
    gameState.ball.y * canvas.height,
    gameState.ball.radius * canvas.height,
    0,
    Math.PI * 2,
    false,
  );
  context.closePath();
  context.fill();
}

function net(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
  const net: INet = {
    x: canvas.width / 2 - 4 / 2,
    y: 0,
    width: 4,
    height: 14,
    color: 'WHITE',
  };
  context.fillStyle = net.color;
  for (let i = 0; i <= canvas.height; i += 30) {
    context.fillRect(net.x, net.y + i, net.width, net.height);
  }
}
