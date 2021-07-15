import React from 'react';
import { Avatar } from './Avatar';
import './Message.css';
import { Button } from './Button';
import { useHistory } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';

export function Message(props: {
  channelId: string;
  tag?: string;
  messages: any[];
  blocked: boolean;
  user: any;
  owner: boolean;
}) {
  const history = useHistory();
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
      history.push(`/pong/${gameFetch.data?.data?.gameId}`);
    }
  }, [gameFetch.done]);

  const deleteMessage = useFetch({
    runOnLoad: false,
    url: '',
    method: 'DELETE',
  });

  const deleteButton = (msgId: string) =>
    props.owner ? ( // TODO moderator/admin
      <Button
        small={true}
        type="secondary"
        onclick={() =>
          deleteMessage.run(
            null,
            `/api/v1/channels/${props.channelId}/messages/${msgId}`,
          )
        }
      >
        ❌
      </Button>
    ) : null;

  return (
    <div className={`messageWrapper ${props.blocked ? 'blocked' : ''}`}>
      <div>
        <Avatar isClickable user={props.user} blocked={props.blocked} />
      </div>
      <div>
        <p className="messageUserName">
          {props.blocked ? (
            'Redacted'
          ) : (
            <span>
              {props.user.name}
              {props.tag ? (
                <span className={`tag tag-${props.tag.toLowerCase()}`}>
                  {props.tag}
                </span>
              ) : null}
            </span>
          )}
        </p>
        <div className="messageMessageContainer">
          {!props.blocked ? (
            <>
              {props.messages.map((v) => {
                if (v.type == 0)
                  return (
                    <p key={v.id} className="messageMessage">
                      {v.content}
                      {deleteButton(v.id)}
                    </p>
                  );
                else if (v.type == 1)
                  return (
                    <div key={v.id}>
                      <div className="messageInvite-wrapper">
                        <div className="messageInvite-accent" />
                        <div className="messageInvite-content">
                          <div className="messageInvite-user">
                            <Avatar user={props.user} small />
                            {props.user.name}
                          </div>
                          <p className="text">
                            You&apos;ve been invited to a duel!
                          </p>
                          <Button
                            loading={gameFetch.loading}
                            onclick={() => runDuelAccept(v.id)}
                          >
                            Accept
                          </Button>
                          {gameFetch.error ? (
                            <p className="error">
                              Something went wrong, try again later.
                            </p>
                          ) : null}
                          <div className="red-cube"></div>
                          <div className="dark-cube"></div>
                        </div>
                      </div>
                      {deleteButton(v.id)}
                    </div>
                  );
                else
                  return (
                    <p key={v.id} className="messageMessage">
                      Unknown message type
                      {deleteButton(v.id)}
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
