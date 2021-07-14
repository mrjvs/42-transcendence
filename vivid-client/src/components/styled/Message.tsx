import React from 'react';
import './Message.css';
import { Button } from './Button';
import { useFetch } from '../../hooks/useFetch';

export function Message(props: {
  channelId: string;
  messageId: string;
  username: string;
  tag?: string;
  userColors: string[];
  messages: string[];
  blocked: boolean;
  owner: boolean;
}) {
  const { run } = useFetch({
    runOnLoad: false,
    url: `/api/v1/channels/${props.channelId}/messages/${props.messageId}`,
    method: 'DELETE',
  });

  return (
    <div className={`messageWrapper ${props.blocked ? 'blocked' : ''}`}>
      <div>
        <div
          className="messageUserAvatar"
          style={{
            background: `linear-gradient(to right, ${props.userColors[0]}, ${props.userColors[1]})`,
          }}
        ></div>
      </div>
      <div>
        <p className="messageUserName">
          {props.blocked ? 'Redacted' : props.username}
        </p>
        <div className="messageMessageContainer">
          {!props.blocked ? (
            props.messages.map((v, i) => (
              <p key={i} className="messageMessage">
                {v}
                {props.owner ? ( // TODO moderator/admin
                  <Button small={true} type="secondary" onclick={() => run()}>
                    ❌
                  </Button>
                ) : null}
              </p>
            ))
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
