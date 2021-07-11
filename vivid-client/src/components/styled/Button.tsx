import React from 'react';
import './Button.css';

export function Button(props: {
  children: any;
  onclick: () => void;
  badge?: number;
  small?: boolean;
  loading?: boolean;
  type?: 'primary' | 'secondary' | 'duel';
}) {
  const type = props.type || 'primary';
  return (
    <button
      className={`button-new ${props.small ? 'small' : ''} button-${type}`}
      onClick={props.onclick}
    >
      {props.loading ? <div className="loader"></div> : null}
      {props.children}
      {props.badge !== undefined ? (
        <span className="badge">{props.badge}</span>
      ) : null}
    </button>
  );
}
