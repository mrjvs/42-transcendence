import React from 'react';
import './LoadingView.css';

export function LoadingView(props: {
  children: any;
  fadein?: boolean;
  icon?: boolean;
}) {
  return (
    <div className={`loading-view ${props.fadein ? 'fadein' : ''}`}>
      {props.icon ? <div className="icon" /> : null}
      <h1>{props.children}</h1>
    </div>
  );
}
