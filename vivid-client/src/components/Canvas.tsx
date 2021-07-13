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
  const [client2, setClient] = useState<any>(null);
  const [clientState, setClientState] = useState('CONNECTING');

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D | null;

  useEffect(() => {
    const client = socketIOClient(window._env_.VIVID_BASE_URL, {
      withCredentials: true,
      path: '/api/v1/events',
    });

    setClient(client);

    client.on('connect', () => {
      console.log('connected');
      setClientState('CONNECTED');
      clientState;
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
      console.log('disconnected');
      setClientState('DISCONNECTED');
    });

    client.on('gameOver', (winner: string) => {
      alert(`User: "${winner}" won the game`);
    });

    client.on('start', (roomName: string) => client.emit('start', roomName));

    function keydown(event: KeyboardEvent) {
      if (event.key === 'w') client.emit('keydown', -0.01);
      else if (event.key === 's') client.emit('keydown', 0.01);
      else if (event.key === ' ') client.emit('addons', 1);
    }

    function keyup(event: KeyboardEvent) {
      if (event.key === 'w' || event.key === 's') client.emit('keydown', 0);
      else if (event.key === ' ') client.emit('addons', 0);
    }

    function mouseMove(event: MouseEvent) {
      client.emit('mouseMove', event.clientY / canvas.height);
    }

    return () => {
      client.destroy();
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('keyup', keyup);
    };
  }, []);

  function newGame() {
    client2.emit('newGame');
  }

  function joinGame() {
    client2.emit('joinGame', 'e372e47c-3649-44c9-9455-c48f84e3d80d'); // TODO remove hardcoded
  }

  function ready() {
    client2.emit('ready', 'e372e47c-3649-44c9-9455-c48f84e3d80d'); // TODO remove hardcoded
  }

  return (
    <>
      <button onClick={newGame}>New Game</button>
      <button onClick={joinGame}>Join Game</button>
      <button onClick={ready}>Ready</button>
      <canvas ref={canvasRef} height={height} width={width} />
    </>
  );
}
