import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { SocketContext } from '../hooks/useWebsocket';

const matchmakingInterval = 5000;

// TODO styling
export function LadderMatchView() {
  const { id }: any = useParams();
  const history = useHistory();
  const { client } = React.useContext(SocketContext);
  const [status, setStatus] = React.useState('matching');

  function getMatchmakingResult(obj: any) {
    if (obj?.status === 'toolong') {
      setStatus('timeout');
    } else if (obj?.status === 'game') {
      history.push(`/pong/${obj?.gameId}`);
    } else {
      setStatus('matching');
    }
  }

  // interval for requesting matchmaking
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (status === 'matching') {
        client.emit('matchmaking', {
          ladderId: id,
        });
      }
    }, matchmakingInterval);
    return () => {
      clearInterval(interval);
    };
  }, [status]);

  // receive result events
  React.useEffect(() => {
    if (client) {
      client.on('matchmakingStatus', getMatchmakingResult);
    }
    return () => {
      if (client) {
        client.off('matchmakingStatus', getMatchmakingResult);
      }
    };
  }, [client]);

  if (status === 'timeout') {
    return <div>Waiting too long for a match</div>;
  }

  return <div>Matchmaking...</div>;
}
