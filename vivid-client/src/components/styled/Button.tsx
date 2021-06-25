import React from 'react';
import './Button.css';

export function Button(props: {
  children: any;
  onclick: () => void;
  badge: number;
  small?: boolean;
}) {
  return (
    <button
      className={`button-new ${props.small ? 'small' : ''}`}
      onClick={props.onclick}
    >
      {props.children}
      <span className="badge">{props.badge}</span>
    </button>
  );
}
