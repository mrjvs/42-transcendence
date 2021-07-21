import React from 'react';
import { SocketContext } from './useWebsocket';

export const StatusContext = React.createContext<any>({});
StatusContext.displayName = 'StatusContext';

export function useStatusContext() {
  const { client } = React.useContext(SocketContext);
  const [statuses, setStatuses] = React.useState<any>({});

  function onStatusUpdate(data: any) {
    setStatuses((old: any) => {
      const n = { ...old };
      if (data.status === 'OFFLINE') n[data.userId] = undefined;
      else n[data.userId] = data.status;
      return n;
    });
  }

  function onStatusList(data: any) {
    setStatuses(
      data.reduce((a: any, v: any) => {
        a[v.userId] = v.status;
        return a;
      }, {}),
    );
  }

  function getStatus(userId: string) {
    if (!statuses[userId]) return 'OFFLINE';
    return statuses[userId];
  }

  React.useEffect(() => {
    if (client) {
      client.on('status_update', onStatusUpdate);
      client.on('status_list', onStatusList);
      client.emit('status_request');
    }
    return () => {
      if (client) {
        client.off('status_update', onStatusUpdate);
        client.off('status_list', onStatusList);
      }
    };
  }, [client]);

  return {
    statuses,
    getStatus,
  };
}
