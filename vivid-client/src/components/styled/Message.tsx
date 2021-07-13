import React from 'react';
import { Avatar } from './Avatar';
import './Message.css';
import { Button } from './Button';

export function Message(props: {
  tag?: string;
  messages: any[];
  blocked: boolean;
  user: any;
}) {
  return (
    <div className={`messageWrapper ${props.blocked ? 'blocked' : ''}`}>
      <div>
        <Avatar isClickable user={props.user} />
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
            props.messages.map((v, i) => {
              if (v.type == 0)
                return (
                  <p key={i} className="messageMessage">
                    {v.content}
                  </p>
                );
              else if (v.type == 1)
                return (
                  <div key={i} className="messageInvite-wrapper">
                    <div className="messageInvite-accent"></div>
                    <div className="messageInvite-content">
                      <div className="messageInvite-user">
                        <Avatar user={props.user} small />
                        {props.user.name}
                      </div>
                      <p>You&apos;ve been invited to a duel!</p>
                      <Button onclick={() => alert('Accepted')}>Accept</Button>
                      <div className="red-cube"></div>
                      <div className="dark-cube"></div>
                    </div>
                  </div>
                );
              else return <p>placeholder</p>;
            })
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
