import React from 'react';
import { StatusContext } from '../../hooks/useStatuses';
import './Avatar.css';

function StatusBubble(props: { userId: string }) {
  const { getStatus } = React.useContext(StatusContext);
  return (
    <div className={`status-bubble status-${getStatus(props.userId)}`}></div>
  );
}

export function Avatar(props: {
  user: any;
  small?: boolean;
  noStatus?: boolean;
}) {
  return (
    <div
      className={`userAvatar ${props.small ? 'small' : ''}`}
      style={{
        background: `linear-gradient(to right, ${props.user?.avatar_colors?.[0]}, ${props.user?.avatar_colors?.[1]})`,
      }}
    >
      {!props.noStatus ? <StatusBubble userId={props.user?.id} /> : null}
    </div>
  );
}
