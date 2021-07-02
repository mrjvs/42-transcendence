import React, { useRef, useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import { drawGame } from '../views/game/Draw';
import { IGameState } from '../views/game/Constants';
import usePong from '../hooks/usePong';

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
  let playerNumber: number;

  useEffect(() => {
    const client = socketIOClient(window._env_.VIVID_BASE_URL, {
      withCredentials: true,
      path: '/api/v1/events',
    });

    setClient(client);

    client.on('connect', () => {
      setClientState('CONNECTED');
      clientState;
    });

    client.on('init', (nb: number) => {
      playerNumber = nb;
      if (!canvasRef.current) return;

      canvas = canvasRef.current;
      context = canvas.getContext('2d');

      if (!context) return;

      document.addEventListener('keydown', keydown);
      document.addEventListener('keyup', keyup);
    });

    client.on('render', (gameState: IGameState) => {
      if (context === null) return;

      requestAnimationFrame(() => {
        drawGame(gameState, canvas, context);
      });
    });

    client.on('disconnect', () => {
      setClientState('DISCONNECTED');
    });

    client.on('gameOver', (winner: number) => {
      if (playerNumber === winner) alert('You win!');
      else alert('You lose...');
    });

    function keydown(event: KeyboardEvent) {
      let move: number;
      if (event.key === 'w') move = -0.01;
      else if (event.key === 's') move = 0.01;
      else return;
      client.emit('keydown', { clientId: client.id, move });
    }

    function keyup(event: KeyboardEvent) {
      if (event.key === 'w' || event.key === 's')
        client.emit('keydown', { clientId: client.id, move: 0 });
    }

    return () => {
      client.destroy();
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('keyup', keyup);
    };
  }, []);

  function newGame() {
    client2.emit('newGame', client2.id);
  }

  function joinGame() {
    client2.emit('joinGame', {
      clientId: client2.id,
      roomName: 'e372e47c-3649-44c9-9455-c48f84e3d80d', // TODO how to join game?
    });
  }

  return (
    <>
      <button onClick={newGame}>New Game</button>
      <button onClick={joinGame}>Join Game</button>
      <canvas ref={canvasRef} height={height} width={width} />
    </>
  );
}
