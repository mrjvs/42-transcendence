import React from 'react';
import { PongGameCanvas } from '../components/Canvas';
import { useHistory, useParams } from 'react-router-dom';
import './PongView.css';
import { SocketContext } from '../hooks/useWebsocket';
import { IGameState } from './game/Constants';
import { UserContext } from '../hooks/useUser';
import { Button } from '../components/styled/Button';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import { AddonData, AddonList } from './game/Powerup';
import { Icon } from '../components/styled/Icon';

momentDurationFormatSetup(moment as any);

export function PongView() {
  const { id }: any = useParams();
  const { client } = React.useContext(SocketContext);
  const { user } = React.useContext(UserContext);
  const history = useHistory();
  const [gameState, setGameState] = React.useState<IGameState | null>(null);
  const [gameStatus, setGameStatus] = React.useState<string>('fetching');

  // gamestate update
  function updateGameState(newState: IGameState) {
    setGameState(newState);
  }

  function readyReturn(readyState: { status: string; match?: IGameState }) {
    setGameStatus(readyState.status);
    if (readyState.match) setGameState(readyState.match);
  }

  // client loading
  React.useEffect(() => {
    if (client) {
      // on load
      client.emit('ready', {
        gameId: id,
      });
      client.on('drawGame', updateGameState);
      client.on('readyReturn', readyReturn);
    }

    return () => {
      // on unload
      if (client) {
        client.emit('gameleave');
        client.off('drawGame', updateGameState);
        client.off('readyReturn', readyReturn);
      }
    };
  }, [client, id]);

  const leftPlayer = gameState?.players[0].userId
    ? {
        name: gameState?.players[0].name || 'Unknown user',
        userId: gameState?.players[0].userId,
        index: 0,
        waiting: false,
      }
    : {
        name: 'Unknown user',
        waiting: true,
      };
  const rightPlayer = gameState?.players[1].userId
    ? {
        name: gameState?.players[1].name || 'Unknown user',
        userId: gameState?.players[1].userId,
        index: 1,
        waiting: false,
      }
    : {
        name: 'Unknown user',
        waiting: true,
      };

  const scores = (gameState?.players.map((v) => v.score) || [0, 0]).map((v) =>
    v.toString().padStart(2, '0'),
  );
  const spectators = gameState?.spectators.length || 0;
  const isSpectating = gameState?.spectators.find((v) => v === user.id);
  const self = rightPlayer.userId === user.id ? rightPlayer : leftPlayer;

  if (gameStatus === 'fetching')
    return (
      <div className="pong-wrapper">
        <div className="pong-endcard">
          <h2 className="pong-endcard-title">Loading game...</h2>
          <Button type="secondary" onclick={() => history.push('/')}>
            Back to home
          </Button>
        </div>
      </div>
    );

  if (gameStatus === 'notfound')
    return (
      <div className="pong-wrapper">
        <div className="pong-wrapper">
          <div className="pong-endcard">
            <h2 className="pong-endcard-title">
              This match doesn&apos;t exist
            </h2>
            <Button type="secondary" onclick={() => history.push('/')}>
              Back to home
            </Button>
          </div>
        </div>
      </div>
    );

  if (gameState?.endReason) {
    return (
      <div className="pong-wrapper">
        <div className="pong-endcard">
          <h2 className="pong-endcard-title">
            {gameState?.pastGame
              ? 'This game has already finished'
              : 'Well played!'}
          </h2>
          <div className="pong-endcard-scores">
            <div className="pong-endcard-score">
              <Icon
                type="crown"
                className={`pong-endcard-crown ${
                  gameState?.winner === leftPlayer.userId ? '' : 'hide'
                }`}
              />
              <h2 className="pong-endcard-score-num">{scores[0]}</h2>
              <p className="pong-endcard-score-name">{leftPlayer.name}</p>
            </div>
            <div className="pong-endcard-score">
              <Icon
                type="crown"
                className={`pong-endcard-crown ${
                  gameState?.winner === rightPlayer.userId ? '' : 'hide'
                }`}
              />
              <h2 className="pong-endcard-score-num">{scores[1]}</h2>
              <p className="pong-endcard-score-name red">{rightPlayer.name}</p>
            </div>
          </div>
          <div className="pong-endcard-keyvalue">
            <p className="pong-key">Time elapsed</p>
            <p className="pong-value">
              {moment
                .duration(gameState?.amountOfSeconds, 'seconds')
                .format('m[m] s[s]')}
            </p>
          </div>
          <div className="pong-endcard-keyvalue pong-marginbottom">
            <p className="pong-key">Addons</p>
            <div className="pong-value">
              <AddonList addons={gameState?.settings.addons} />
            </div>
          </div>
          <Button type="secondary" onclick={() => history.push('/')}>
            Back to home
          </Button>
        </div>
      </div>
    );
  }

  // TODO go back instead of home all the time
  // TODO spectator if same userid
  return (
    <div className="pong-wrapper">
      <div className="pong-game-view">
        <div className="pong-score">
          <div
            className={`pong-score-name right-align ${
              leftPlayer.waiting ? 'gray' : ''
            }`}
          >
            {leftPlayer.waiting ? 'Waiting for opponent' : leftPlayer.name}
          </div>
          <div className="pong-score-points right-align">{scores[0]}</div>
          <div className="pong-score-dash" />
          <div className="pong-score-points left-align">{scores[1]}</div>
          <div
            className={`pong-score-name left-align red ${
              rightPlayer.waiting ? 'gray' : ''
            }`}
          >
            {rightPlayer.waiting ? 'Waiting for opponent' : rightPlayer.name}
          </div>
        </div>
        <PongGameCanvas
          gameId={id}
          gameState={gameState}
          loading={leftPlayer.waiting || rightPlayer.waiting}
          selfIndex={self.index}
        />
        {isSpectating ? (
          <p className="pong-spectators">You are spectating</p>
        ) : (
          <AddonData
            activatedTicks={
              gameState?.players[self.index as any]?.activatedTicks
            }
            activatedMax={
              gameState?.players[self.index as any]?.activatedTicksMax
            }
            currentAddon={gameState?.players[self.index as any]?.stashedAddon}
            countdown={
              gameState?.players[self.index as any]?.addonUsageCountdown
            }
            show={!!gameState && gameState.settings.addons.length > 0}
          />
        )}
        <p className="pong-spectators topleft">
          {spectators == 0
            ? 'Nobody is spectating'
            : `${spectators} spectator${spectators != 1 ? 's' : ''}`}
        </p>
      </div>
    </div>
  );
}
