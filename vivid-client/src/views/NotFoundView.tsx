import React from 'react';
import './NotFoundView.css';

export function NotFoundView(props: { children: any }) {
  return (
    <div className="not-found-view">
      <h1 className="neon-text pulsate">{props.children}</h1>
    </div>
  );
}
