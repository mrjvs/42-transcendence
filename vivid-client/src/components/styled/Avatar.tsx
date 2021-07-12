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
  let background;
  if (!props.user.avatar)
    background = `linear-gradient(to right, ${props.user?.avatar_colors?.[0]}, ${props.user?.avatar_colors?.[1]})`;
  else
    background = `url(${window._env_.VIVID_BASE_URL}/api/v1/users/avatar/${props.user.avatar})`;

  return (
    <div
      className={`userAvatar ${props.small ? 'small' : ''}`}
      style={{
        backgroundImage: background,
      }}
    >
      {!props.noStatus ? <StatusBubble userId={props.user?.id} /> : null}
    </div>
  );
}
