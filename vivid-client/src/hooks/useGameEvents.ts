import React from 'react';
import { SocketContext } from './useWebsocket';

export const GameEventContext = React.createContext<any>({});
GameEventContext.displayName = 'GameEventContext';

export function useGameEvents() {
  const { client } = React.useContext(SocketContext);
  const [events, setEvents] = React.useState<any>({});

  function subscribe(gameId: string) {
    setEvents((old: any) => {
      const data = { ...old };
      if (!data[gameId]) {
        data[gameId] = {
          subscribed: true,
          status: 'loading',
        };
        client?.emit('subscribeGame', gameId);
      }
      return data;
    });
  }

  function onGameEvent({ gameId, status }: { gameId: string; status: string }) {
    setEvents((old: any) => {
      const data = { ...old };
      if (data[gameId]) {
        data[gameId].status = status;
      }
      return data;
    });
  }

  function getGameStatus(gameId: string) {
    if (events[gameId]) return events[gameId];
    return {
      subscribed: false,
      status: 'unknown',
    };
  }

  React.useEffect(() => {
    if (client) {
      client.on('gameSubscribeReturn', onGameEvent);
    }
    return () => {
      if (client) {
        client.off('gameSubscribeReturn', onGameEvent);
      }
    };
  }, [client]);

  return {
    events,
    subscribe,
    getGameStatus,
  };
}
