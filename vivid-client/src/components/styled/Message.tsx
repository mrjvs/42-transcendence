import React from 'react';
import { Avatar } from './Avatar';
import './Message.css';

export function Message(props: {
  tag?: string;
  messages: string[];
  blocked: boolean;
  user: any;
}) {
  return (
    <div className={`messageWrapper ${props.blocked ? 'blocked' : ''}`}>
      <div>
        <Avatar user={props.user} />
      </div>
      <div>
        <p className="messageUserName">
          {props.blocked ? 'Redacted' : props.user.name}
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
