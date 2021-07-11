import React from 'react';
import './Avatar.css';

export function Avatar(props: { user: any }) {
  return (
    <div
      className="userAvatar"
      style={{
        background: `linear-gradient(to right, ${props.user?.avatar_colors?.[0]}, ${props.user?.avatar_colors?.[1]})`,
      }}
    />
  );
}
