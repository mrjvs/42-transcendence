import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

export function GameView() {
  const history = useHistory();
  const [gameId, setGameId] = useState<string>('');

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
