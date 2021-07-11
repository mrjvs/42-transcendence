import React from 'react';

export function Avatar(props: { user: any }) {
  return (
    <div
      className="messageUserAvatar"
      style={{
        background: `linear-gradient(to right, ${props.user?.avatar_colors?.[0]}, ${props.user?.avatar_colors?.[1]})`,
      }}
    />
  );
}
