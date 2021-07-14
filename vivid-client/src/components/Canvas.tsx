import React from 'react';
import { drawGame } from '../views/game/Draw';
import { IGameState } from '../views/game/Constants';
import { SocketContext } from '../hooks/useWebsocket';

interface CanvasProps {
  width: number;
  height: number;
}

export function Canvas({ width, height }: CanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { client } = React.useContext(SocketContext);

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D | null;

  function ready() {
    client?.emit('ready');
  }

  function init() {
    if (!canvasRef.current) return;

    canvas = canvasRef.current;
    context = canvas.getContext('2d');

    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
    document.addEventListener('mousemove', mouseMove);
  }

  function draw(gameState: IGameState) {
    if (context === null) return;
    requestAnimationFrame(() => {
      drawGame(gameState, canvas, context);
    });
  }

  function gameOver(winner: string) {
    alert(`User: "${winner}" won the game`);
  }

  function start(gameId: string) {
    client?.emit('start', gameId);
  }

  function keydown(event: KeyboardEvent) {
    if (event.key === 'w') client?.emit('keydown', -0.01);
    else if (event.key === 's') client?.emit('keydown', 0.01);
  }

  function keyup(event: KeyboardEvent) {
    if (event.key === 'w' || event.key === 's') client?.emit('keydown', 0);
  }

  function mouseMove(event: MouseEvent) {
    client?.emit('mouseMove', event.clientY / canvas.height);
  }

  React.useEffect(() => {
    if (client) {
      ready();
      client.on('init', init);
      client.on('start', start);
      client.on('drawGame', draw);
      client.on('gameOver', gameOver);
    }

    return () => {
      if (client) {
        client.off('init', init);
        client.off('start', start);
        client.off('drawGame', draw);
        client.off('gameOver', gameOver);
      }
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('keyup', keyup);
      document.removeEventListener('mousemove', mouseMove);
    };
  }, [client]);

  return (
    <>
      <canvas ref={canvasRef} height={height} width={width} />
    </>
  );
}
