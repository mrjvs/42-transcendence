import React from 'react';
import { Avatar } from './Avatar';
import './Message.css';
import './Tags.css';
import { Button } from './Button';
import { useHistory } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { Icon } from './Icon';
import { GameEventContext } from '../../hooks/useGameEvents';
import TrackVisibility from '../base/TrackVisibility';
import partyParrot from '../../assets/partyparrot.gif';

function DuelMessage(props: { message: any; channelId: string; user: any }) {
  const history = useHistory();
  const inviteId = props.message?.aux_content?.invite_game_id;
  const { getGameStatus, subscribe } = React.useContext(GameEventContext);
  const gameFetch = useFetch({
    url: '',
    method: 'POST',
  });

  function runDuelAccept(messageId: string) {
    gameFetch.run(
      null,
      `/api/v1/channels/${props.channelId}/messages/${messageId}/duel`,
    );
  }

  React.useEffect(() => {
    // redirect once accepted duel
    if (gameFetch.done) {
      if (!gameFetch.data?.data?.gameId) return;
      history.push(`/pong/${gameFetch.data?.data?.gameId}`);
    }
  }, [gameFetch.done]);

  React.useEffect(() => {
    if (inviteId) subscribe(inviteId);
  }, [props.message]);

  const texts = {
    finished: [
      'Match has ended',
      'See match results',
      '',
      'hideCubes',
      'secondary',
    ],
    progress: [
      'Duel in progress',
      'Spectate',
      'blue',
      'hideCubes',
      'secondary',
    ],
    waiting: ['Waiting for a duel opponent', 'Accept', 'green', '', 'primary'],
    unknown: [
      'Match state is unknown',
      'Accept',
      'green',
      'hideCubes',
      'primary',
    ],
    loading: ['loading'],
  };
  let status: any = getGameStatus(inviteId).status;
  if (status === 'countdown' || status === 'playing') status = texts.progress;
  else if (status === 'finished') status = texts.finished;
  else if (status === 'waiting') status = texts.waiting;
  else if (status === 'loading') status = texts.loading;
  else status = texts.unknown;

  return (
    <div className={`messageInvite-wrapper ${status[3]}`}>
      <div className={`messageInvite-accent ${status[2]}`} />
      {status[0] === 'loading' ? (
        <div className="messageInvite-content">loading...</div>
      ) : (
        <div className="messageInvite-content">
          <div className="messageInvite-user">
            <Avatar user={props.user} small />
            {props.user.name}
          </div>
          <p className="text">{status[0]}</p>
          <Button
            type={status[4]}
            loading={gameFetch.loading}
            onclick={() => runDuelAccept(props.message.id)}
          >
            {status[1]}
          </Button>
          {gameFetch.error ? (
            <p className="error">Something went wrong, try again later.</p>
          ) : null}
          <div className="red-cube"></div>
          <div className="dark-cube"></div>
        </div>
      )}
    </div>
  );
}

export function Message(props: {
  channelId: string;
  tag?: string;
  messages: any[];
  blocked: boolean;
  user: any;
  tags: string[];
  owner: boolean;
  channelData: any;
  currentChannelUser: any;
}) {
  const deleteMessage = useFetch({
    runOnLoad: false,
    url: '',
    method: 'DELETE',
  });

  function DeleteButton({ msgId }: { msgId: string }) {
    if (
      !props.owner && // not owner message
      props.channelData?.owner !== props.currentChannelUser.user.user && // not owner
      !props.currentChannelUser.user.is_mod // not mod
    )
      return null;

    return (
      <span className="message-delete-button">
        <Button
          type="small-box"
          onclick={() => {
            deleteMessage.run(
              null,
              `/api/v1/channels/${props.channelId}/messages/${msgId}`,
            );
          }}
        >
          <Icon className="red-icon" type="trashcan" />
        </Button>
      </span>
    );
  }

  return (
    <div className={`messageWrapper ${props.blocked ? 'blocked' : ''}`}>
      <div>
        <Avatar isClickable user={props.user} blocked={props.blocked} />
      </div>
      <div style={{ flex: 1 }}>
        <p className="messageUserName">
          {props.blocked ? (
            'Redacted'
          ) : (
            <span>
              {props.user.name}
              {props.tags
                ? props.tags
                    .filter((v) => v)
                    .map((v) => (
                      <span
                        key={v}
                        className={`user-tag tag-${v.toLowerCase()}`}
                      >
                        {v.toLowerCase()}
                      </span>
                    ))
                : null}
            </span>
          )}
        </p>
        <div className="messageMessageContainer">
          {!props.blocked ? (
            <>
              {props.messages.map((v) => {
                if (v.type == 0)
                  return (
                    <p key={v.id} className="messageContent messageMessage">
                      <span className="bg-underlay bg-layers" />
                      <span className="bg-overlay bg-layers">
                        <DeleteButton msgId={v.id} />
                      </span>
                      {v.content}
                    </p>
                  );
                else if (v.type == 42) {
                  return (
                    <p key={v.id} className="messageContent messageMessage">
                      <span className="bg-underlay bg-layers" />
                      <span className="bg-overlay bg-layers">
                        <DeleteButton msgId={v.id} />
                      </span>
                      <img className="partyparrot" src={partyParrot} />
                    </p>
                  );
                } else if (v.type == 1)
                  return (
                    <div key={v.id} className="messageMessage">
                      <span className="bg-underlay bg-layers" />
                      <span className="bg-overlay bg-layers">
                        <DeleteButton msgId={v.id} />
                      </span>
                      <div className="messageDuelMessageContainer">
                        <TrackVisibility
                          className="messageInvite-wrapper-wrapper"
                          partialVisibility
                        >
                          {({ isVisible }: { isVisible: boolean }) =>
                            isVisible && (
                              <DuelMessage
                                user={props.user}
                                message={v}
                                channelId={props.channelId}
                              />
                            )
                          }
                        </TrackVisibility>
                      </div>
                    </div>
                  );
                else if (v.type == 2) {
                  return (
                    <p
                      key={v.id}
                      className="messageContent messageMessage message-special"
                    >
                      <span className="bg-underlay bg-layers" />
                      <span className="bg-overlay bg-layers">
                        <DeleteButton msgId={v.id} />
                      </span>
                      <span className="messageUserNameSpecial">
                        {props.user.name}
                      </span>
                      has joined the channel
                    </p>
                  );
                } else if (v.type == 3) {
                  return (
                    <p
                      key={v.id}
                      className="messageContent messageMessage message-special"
                    >
                      <span className="bg-underlay bg-layers" />
                      <span className="bg-overlay bg-layers">
                        <DeleteButton msgId={v.id} />
                      </span>
                      <span className="messageUserNameSpecial">
                        {props.user.name}
                      </span>
                      has left the channel
                    </p>
                  );
                } else
                  return (
                    <p key={v.id} className="messageMessage">
                      <span className="bg-underlay bg-layers" />
                      <span className="bg-overlay bg-layers">
                        <DeleteButton msgId={v.id} />
                      </span>
                      Invalid message
                    </p>
                  );
              })}
            </>
          ) : (
            <p>you&apos;ve blocked this user</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function NoMessage() {
  return (
    <div>
      <h1 className="noMessageIcon">👋</h1>
      <h1 className="noMessageHeading">This is the start of the channel</h1>
      <p className="noMessageParagraph">
        You&apos;ve gone far enough back into the history that you&apos;ve
        reached the begin of the universe (or well, this channel)
      </p>
      <hr className="noMessageDivider" />
    </div>
  );
}
