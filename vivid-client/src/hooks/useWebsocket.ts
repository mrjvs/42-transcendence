import React from 'react';
import socketIOClient from 'socket.io-client';

export const SocketContext = React.createContext<any>(null);

export function useWebsocket() {
  const [clientState, setClientState] = React.useState('CONNECTING');
  const [client, setClient] = React.useState<any>(null);
  const [hasConnected, setHasConnected] = React.useState(false);
  const [error, setError] = React.useState(false);

  function connect() {
    const sclient = socketIOClient(window._env_.VIVID_BASE_URL, {
      withCredentials: true,
      path: '/api/v1/events',
    });

    // wait 10 seconds, otherwise assume broken
    let timeout: any = setTimeout(() => {
      setClient(null);
      sclient.disconnect();
      setError(true);
    }, 10000);

    sclient.on('connect', () => {
      if (!hasConnected) setHasConnected(true);
      setClientState('CONNECTED');
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    });

    sclient.on('logout', () => {
      window.location.href = '/';
    });

    sclient.on('disconnect', () => {
      setClientState('DISCONNECTED');
    });

    setClient(sclient);
  }

  // destroy client if exists
  React.useEffect(() => {
    return () => {
      if (client) client.disconnect();
      setClient(null);
    };
  }, []);

  return {
    clientState,
    client,
    hasConnected,
    connect,
    clientError: error,
  };
}
