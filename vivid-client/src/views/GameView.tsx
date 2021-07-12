import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import socketIOClient from 'socket.io-client';

export function GameView() {
  const [clientState, setClientState] = useState('CONNECTING');
  const history = useHistory();
  const [gameId, setGameId] = useState<string>('');

  useEffect(() => {
    const client = socketIOClient(window._env_.VIVID_BASE_URL, {
      withCredentials: true,
      path: '/api/v1/events',
    });

    client.on('connect', () => {
      setClientState('CONNECTED');
      clientState;
    });
  }, []);

  function createGame() {
    fetch(`${window._env_.VIVID_BASE_URL}/api/v1/channels/game`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((result) => {
        history.push(`/pong/${result.gameId}`);
      });
  }

  function joinGame(gameId: any) {
    fetch(`${window._env_.VIVID_BASE_URL}/api/v1/channels/game/${gameId}`, {
      method: 'PUT',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((result) => {
        history.push(`/pong/${result.gameId}`);
      });
  }

  function onSubmit(e: any) {
    e.preventDefault();
    joinGame(gameId);
  }

  return (
    <>
      <button onClick={createGame}>Create Game</button>
      <form onSubmit={onSubmit}>
        <label>GameID</label>
        <input
          type="text"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
        />
      </form>
    </>
  );
}
