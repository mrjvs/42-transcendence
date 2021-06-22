import React from 'react';
import './ActionRow.css';

export function ActionRow(props: { children?: any; label: string }) {
  return (
    <div className="action-row">
      <div className="action-row-label">{props.label}</div>
      <div>{props.children}</div>
    </div>
  );
}
