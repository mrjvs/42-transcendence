import React from 'react';
import { StatusContext } from '../../hooks/useStatuses';
import './Avatar.css';
import { UserProfileModal } from './modals/UserProfile.modal';

function StatusBubble(props: { userId: string; color?: string }) {
  const { getStatus } = React.useContext(StatusContext);
  return (
    <div
      className={`status-bubble status-${getStatus(props.userId)}`}
      style={{
        borderColor: props.color,
      }}
    ></div>
  );
}

export function Avatar(props: {
  user: any;
  small?: boolean;
  noStatus?: boolean;
  isClickable?: boolean;
  blocked?: boolean;
  color?: string;
}) {
  let background;
  if (!props.user) return null;
  if (!props.user.avatar)
    background = `linear-gradient(to right, ${props.user?.avatar_colors?.[0]}, ${props.user?.avatar_colors?.[1]})`;
  else
    background = `url(${window._env_.VIVID_BASE_URL}/cdn/avatars/${props.user.avatar})`;

  const [state, setState] = React.useState(false);

  return (
    <div>
      <div
        className={`userAvatar ${props.small ? 'small' : ''}  ${
          props.blocked ? 'blocked' : ''
        } ${props.isClickable ? 'clickable' : ''}`}
        style={{
          backgroundImage: background,
        }}
        onClick={() => setState(true)}
      >
        {!props.noStatus ? (
          <StatusBubble userId={props.user?.id} color={props.color} />
        ) : null}
      </div>
      {props.isClickable ? (
        <UserProfileModal
          user={props.user}
          open={state}
          close={() => setState(false)}
        />
      ) : null}
    </div>
  );
}
