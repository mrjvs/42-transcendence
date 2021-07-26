import React from 'react';
import './ToggleButton.css';

export function ToggleButton(props: {
  checked: boolean;
  setter: (b: boolean) => void;
  children: any;
}) {
  return (
    <div
      className={`toggle-button ${props.checked ? 'checked' : ''}`}
      onClick={(e) => {
        e.preventDefault();
        props.setter(!props.checked);
      }}
    >
      {props.children}
    </div>
  );
}
