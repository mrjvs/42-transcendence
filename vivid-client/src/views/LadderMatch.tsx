import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { SocketContext } from '../hooks/useWebsocket';
import { Button } from '../components/styled/Button';
import { Icon } from '../components/styled/Icon';
import '../components/styled/LoadingScreen.css';
import { ControlsModal } from '../components/styled/modals/ControlsModal';

const matchmakingInterval = 5000;

function statusToText(str: string) {
  switch (str) {
    case 'loading':
      return 'Connecting';
    case 'matching':
      return 'Finding opponent';
    case 'error':
      return 'Server error, trying again';
    default:
      return 'Doing something';
  }
}

export function LadderMatchView() {
  const { id }: any = useParams();
  const history = useHistory();
  const { client } = React.useContext(SocketContext);
  const [status, setStatusReal] = React.useState('loading');
  const statusRef = React.useRef('loading');
  const [rank, setRank] = React.useState<any>(null);

  function setStatus(str: string) {
    statusRef.current = str;
    setStatusReal(str);
  }

  function onDisconnect() {
    setStatus('loading');
  }

  function getMatchmakingResult(obj: any) {
    // if in matchmaking too long
    if (obj?.status === 'toolong') {
      setStatus('timeout');
    }
    // if matchingmaking is registered
    else if (obj?.status === 'matching') {
      setStatus('matching');
      if (obj?.rank) {
        setRank(obj?.rank);
      }
    }
    // if found game
    else if (obj?.status === 'game') {
      history.push(`/pong/${obj?.gameId}`);
    }
    // if alreadyin and is first result
    else if (obj?.status === 'alreadyin') {
      if (statusRef.current === 'loading') setStatus('alreadyin');
    } else if (obj?.status === 'error') {
      setStatus('error');
    } else {
      setStatus('matching');
    }
  }

  // receive result events
  React.useEffect(() => {
    if (client) {
      onDisconnect();
      client.on('matchmakingStatus', getMatchmakingResult);
      client.on('disconnect', onDisconnect);
    }
    return () => {
      if (client) {
        client.emit('matchmakingLeave');
        client.off('matchmakingStatus', getMatchmakingResult);
        client.off('disconnect', onDisconnect);
      }
    };
  }, [client]);

  // interval for requesting matchmaking
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (['error', 'matching', 'loading'].includes(statusRef.current)) {
        client?.emit('matchmaking', {
          ladderId: id,
        });
      }
    }, matchmakingInterval);
    client?.emit('matchmaking', {
      ladderId: id,
    });
    return () => {
      clearInterval(interval);
    };
  }, [client]);

  if (status === 'timeout') {
    return (
      <div className="loading-screen">
        <div className="overlay" />
        <div className="icon-wrapper">
          <div className="icon hidden bigload" />
          <div className="loading-match">
            <span className="loading-match-rank" />
            <h1 className="loading-match-heading">
              We couldn&apos;t find an opponent
            </h1>
            <p className="loading-match-text bigmargin">Sorry about that</p>
            <Button
              type="secondary"
              more_padding
              onclick={() => history.push('/')}
            >
              Back to home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'alreadyin') {
    return (
      <div className="loading-screen">
        <div className="overlay" />
        <div className="icon-wrapper">
          <div className="icon hidden bigload" />
          <div className="loading-match">
            <span className="loading-match-rank" />
            <h1 className="loading-match-heading">
              You are already matchmaking from another location
            </h1>
            <p className="loading-match-text bigmargin">
              Can&apos;t join multiple times :)
            </p>
            <Button
              type="secondary"
              more_padding
              onclick={() => history.push('/')}
            >
              Back to home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-screen">
      <div className="overlay" />
      <div className="icon-wrapper">
        <div className="icon bigload" />
        <div className="loading-match">
          {rank ? (
            <span
              className={`loading-match-rank ladderCard-rank-color-${rank.color}`}
            >
              <Icon className="loading-match-icon" type={rank.icon} />
              {rank.displayName}
            </span>
          ) : (
            <span className="loading-match-rank" />
          )}
          <h1 className="loading-match-heading">Looking for an opponent</h1>
          <p className="loading-match-text">This could take a while</p>
          <p className="loading-match-status">{statusToText(status)}</p>
          <div className="loading-match-buttons">
            <Button
              type="danger"
              more_padding
              margin_right
              onclick={() => history.push('/')}
            >
              Cancel
            </Button>
            <ControlsModal />
          </div>
        </div>
      </div>
    </div>
  );
}
