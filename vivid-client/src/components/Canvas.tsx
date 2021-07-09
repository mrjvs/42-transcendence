import React, { useRef, useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import { drawGame } from '../views/game/Draw';
import { IGameState } from '../views/game/Constants';

interface CanvasProps {
  width: number;
  height: number;
}

export function Canvas({ width, height }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const [client2, setClient] = useState<any>(null); // TODO nodig?
  const [clientState, setClientState] = useState('CONNECTING');

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D | null;

  useEffect(() => {
    const client = socketIOClient(window._env_.VIVID_BASE_URL, {
      withCredentials: true,
      path: '/api/v1/events',
    });

    client.on('connect', () => {
      setClientState('CONNECTED');
      client.emit('ready', 'e372e47c-3649-44c9-9455-c48f84e3d80d');
    });

    client.on('init', () => {
      if (!canvasRef.current) return;

      canvas = canvasRef.current;
      context = canvas.getContext('2d');

      document.addEventListener('keydown', keydown);
      document.addEventListener('keyup', keyup);
      document.addEventListener('mousemove', mouseMove);
    });

    client.on('drawGame', (gameState: IGameState) => {
      if (context === null) return;
      requestAnimationFrame(() => {
        drawGame(gameState, canvas, context);
      });
    });

    client.on('disconnect', () => {
      setClientState('DISCONNECTED');
    });

    client.on('gameOver', (winner: string) => {
      alert(`User: "${winner}" won the game`);
    });

    client.on('start', (roomName: string) => {
      client.emit('start', roomName);
    });

    function keydown(event: KeyboardEvent) {
      if (event.key === 'w') client.emit('keydown', -0.01);
      else if (event.key === 's') client.emit('keydown', 0.01);
    }

    function keyup(event: KeyboardEvent) {
      if (event.key === 'w' || event.key === 's') client.emit('keydown', 0);
    }

    function mouseMove(event: MouseEvent) {
      client.emit('mouseMove', event.clientY / canvas.height);
    }

    return () => {
      client.destroy();
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('keyup', keyup);
      document.removeEventListener('mousemove', mouseMove);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} height={height} width={width} />
    </>
  );
}
