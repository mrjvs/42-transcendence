import React from 'react';
import './TextInput.css';

export function TextInput(props: {
  value: string;
  set: (text: string) => void;
  label?: string;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className="styled-input">
      <label>
        {props.label ? <span className="text">{props.label}</span> : null}
        <input
          type="text"
          value={props.value}
          onChange={(e) => props.set(e.target.value)}
          className={'styled-input ' + (props.className || '')}
          placeholder={props.placeholder}
        />
      </label>
    </div>
  );
}
