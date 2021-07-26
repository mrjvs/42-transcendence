import React from 'react';
import './TextInput.css';

export function UnusableTextInput(props: {
  label?: string;
  text: string;
  className?: string;
}) {
  return (
    <div className="styled-no-input-container">
      {props.label ? (
        <p className="styled-no-input-label">{props.label}</p>
      ) : null}
      <div className={'styled-no-input ' + (props.className || '')}>
        <p className="input-text">{props.text}</p>
      </div>
    </div>
  );
}

export function TextInput(props: {
  value: any;
  set: (text: string) => void;
  label?: string;
  noPadding?: boolean;
  placeholder: string;
  className?: string;
  lighter?: boolean;
  type?: string;
}) {
  return (
    <div className="styled-input">
      <label>
        {props.label ? (
          <span className={`${props.noPadding ? 'no-padding' : 'text'}`}>
            {props.label}
          </span>
        ) : null}
        <input
          type={`${props.type ? props.type : 'text'}`}
          value={props.value}
          onChange={(e) => props.set(e.target.value)}
          className={
            'styled-input ' +
            (props.className || '') +
            ' ' +
            (props.lighter ? 'lighter ' : ' ')
          }
          placeholder={props.placeholder}
        />
      </label>
    </div>
  );
}
