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
import { ControlsModal } from '../components/styled/modals/ControlsModal';

momentDurationFormatSetup(moment as any);

export function PongView() {
  const { id }: any = useParams();
  const { client } = React.useContext(SocketContext);
  const { user } = React.useContext(UserContext);
  const history = useHistory();
  const [gameState, setGameState] = React.useState<IGameState | null>(null);
  const [gameStatus, setGameStatus] = React.useState<string>('fetching');
  const [playerData, setPlayerData] = React.useState<any>(parseGameState(null));

  function parseGameState(newState: IGameState | null) {
    const leftPlayer = newState?.players[0].userId
      ? {
          name: newState?.players[0].name || 'Unknown user',
          userId: newState?.players[0].userId,
          index: 0,
          waiting: false,
        }
      : {
          name: 'Unknown user',
          waiting: true,
        };
    const rightPlayer = newState?.players[1].userId
      ? {
          name: newState?.players[1].name || 'Unknown user',
          userId: newState?.players[1].userId,
          index: 1,
          waiting: false,
        }
      : {
          name: 'Unknown user',
          waiting: true,
        };

    const scores = (newState?.players.map((v) => v.score) || [0, 0]).map((v) =>
      v.toString().padStart(2, '0'),
    );
    const spectators = newState?.spectators.length || 0;
    const isSpectating = newState?.spectators.find((v) => v === client.id);
    const self = rightPlayer.userId === user.id ? rightPlayer : leftPlayer;
    const isMirrored = self.index === 1;
    return {
      spectators,
      self,
      isMirrored,
      scores,
      leftPlayer,
      rightPlayer,
      isSpectating,
    };
  }

  // gamestate update
  function updateGameState(newState: IGameState) {
    setGameState(newState);
    setPlayerData(parseGameState(newState));
  }

  function readyReturn(readyState: { status: string; match?: IGameState }) {
    setGameStatus(readyState.status);
    if (readyState.match) updateGameState(readyState.match);
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
                  gameState?.winner === playerData.leftPlayer.userId
                    ? ''
                    : 'hide'
                }`}
              />
              <h2 className="pong-endcard-score-num">{playerData.scores[0]}</h2>
              <p className="pong-endcard-score-name">
                {playerData.leftPlayer.name}
              </p>
            </div>
            <div className="pong-endcard-score">
              <Icon
                type="crown"
                className={`pong-endcard-crown ${
                  gameState?.winner === playerData.rightPlayer.userId
                    ? ''
                    : 'hide'
                }`}
              />
              <h2 className="pong-endcard-score-num">{playerData.scores[1]}</h2>
              <p className="pong-endcard-score-name red">
                {playerData.rightPlayer.name}
              </p>
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

  return (
    <div className="pong-wrapper">
      <div className="pong-game-view">
        <PongScores playerData={playerData} mirrored={playerData.isMirrored} />
        <PongGameCanvas
          gameId={id}
          gameState={gameState}
          loading={
            playerData.leftPlayer.waiting || playerData.rightPlayer.waiting
          }
          mirrored={playerData.isMirrored}
        />
        {playerData.isSpectating ? (
          <p className="pong-spectators">You are spectating</p>
        ) : (
          <AddonData
            activatedTicks={
              gameState?.players[playerData.self.index as any]?.activatedTicks
            }
            activatedMax={
              gameState?.players[playerData.self.index as any]
                ?.activatedTicksMax
            }
            currentAddon={
              gameState?.players[playerData.self.index as any]?.stashedAddon
            }
            countdown={
              gameState?.players[playerData.self.index as any]
                ?.addonUsageCountdown
            }
            show={!!gameState && gameState.settings.addons.length > 0}
          />
        )}
        <p className="pong-spectators bottomleft">
          {playerData.spectators == 0
            ? 'Nobody is spectating'
            : `${playerData.spectators} spectator${
                playerData.spectators != 1 ? 's' : ''
              }`}
        </p>
        <ControlsModal className="bottomright" />
      </div>
    </div>
  );
}

function PongScores(props: { playerData: any; mirrored: boolean }) {
  const players = [
    {
      color: '',
      player: props.playerData?.leftPlayer,
      score: props.playerData?.scores[0],
    },
    {
      color: 'red',
      player: props.playerData?.rightPlayer,
      score: props.playerData?.scores[1],
    },
  ];
  if (props.mirrored) players.reverse();

  return (
    <div className="pong-score">
      <div
        className={`pong-score-name right-align ${players[0].color} ${
          players[0].player.waiting ? 'gray' : ''
        }`}
      >
        {players[0].player.waiting
          ? 'Waiting for opponent'
          : players[0].player.name}
      </div>
      <div className="pong-score-points right-align">{players[0].score}</div>
      <div className="pong-score-dash" />
      <div className="pong-score-points left-align">{players[1].score}</div>
      <div
        className={`pong-score-name left-align ${players[1].color} ${
          players[1].player.waiting ? 'gray' : ''
        }`}
      >
        {players[1].player.waiting
          ? 'Waiting for opponent'
          : players[1].player.name}
      </div>
    </div>
  );
}
