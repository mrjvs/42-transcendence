import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import socketIOClient from 'socket.io-client';

export function GameView() {
  const [client2, setClient] = useState<any>(null);
  const [clientState, setClientState] = useState('CONNECTING');
  const history = useHistory();

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
  }, []);

  function newGame() {
    client2.emit('newGame');
  }

  function joinGame() {
    client2.emit(
      'joinGame',
      'e372e47c-3649-44c9-9455-c48f84e3d80d', // TODO how to join game?
    );
    history.push('/pong/e372e47c-3649-44c9-9455-c48f84e3d80d');
  }

  return (
    <>
      <button onClick={newGame}>New Game</button>
      <button onClick={joinGame}>Join Game</button>
    </>
  );
}
