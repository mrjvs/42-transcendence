import React from 'react';
import { drawGame } from '../views/game/Draw';
import { IGameState } from '../views/game/Constants';
import { SocketContext } from '../hooks/useWebsocket';

interface CanvasProps {
  width: number;
  height: number;
  gameId: string;
}

const keyMap = {
  w: {
    press: false,
    key: 'up',
  },
  s: {
    press: false,
    key: 'down',
  },
  ' ': {
    press: true,
    key: 'action',
  },
};

export function Canvas({ width, height, gameId }: CanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { client } = React.useContext(SocketContext);

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D | null;

  // grab context on render
  React.useEffect(() => {
    if (!canvasRef.current) return;

    canvas = canvasRef.current;
    context = canvas.getContext('2d');
  }, [canvasRef]);

  // draw gamestate when you get new data
  // TODO looping animation frame
  function draw(gameState: IGameState) {
    if (context === null) return;
    requestAnimationFrame(() => {
      drawGame(gameState, canvas, context);
    });
  }

  // called when winner is announced
  function gameOver(winner: string) {
    alert(`User: "${winner}" won the game`);
  }

  function keydown(event: KeyboardEvent) {
    if (event.repeat) return;
    const keyData = (keyMap as any)[event.key];
    if (!keyData) return;
    const eventName = keyData.press ? 'keypress' : 'keydown';
    client?.emit(eventName, {
      gameId,
      key: keyData.key,
    });
  }

  function keyup(event: KeyboardEvent) {
    if (event.repeat) return;
    const keyData = (keyMap as any)[event.key];
    if (!keyData) return;
    if (keyData.press) return;
    client?.emit('keyup', {
      gameId,
      key: keyData.key,
    });
  }

  React.useEffect(() => {
    if (client) {
      // on load
      client.emit('ready', {
        gameId,
      });
      client.on('drawGame', draw);
      client.on('gameOver', gameOver);
      document.addEventListener('keydown', keydown);
      document.addEventListener('keyup', keyup);
    }

    return () => {
      // on unload
      if (client) {
        client.emit('gameleave');
        client.off('drawGame', draw);
        client.off('gameOver', gameOver);
      }
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('keyup', keyup);
    };
  }, [client]);

  return (
    <>
      <canvas ref={canvasRef} height={height} width={width} />
    </>
  );
}
