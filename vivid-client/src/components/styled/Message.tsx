import React from 'react';
import './Message.css';

export function Message(props: {
  username: string;
  tag?: string;
  messages: string[];
  blocked: boolean;
}) {
  return (
    <div className={`messageWrapper ${props.blocked ? 'blocked' : ''}`}>
      <div>
        <div className="messageUserAvatar"></div>
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
