import React from 'react';
import './Toggle.css';

export function ToggleButton(props: { children: any }) {
  return <button className="toggle-button">{props.children}</button>;
}
