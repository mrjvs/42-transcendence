import React from 'react';
import './Toggle.css';

export function ToggleButton(props: {
  checked: boolean;
  setChecked: (val: boolean) => void;
  children: any;
}) {
  return (
    <label className="toggleSwitch">
      <input
        type="checkbox"
        className="toggleSwitchInput"
        checked={props.checked}
        onChange={(e) => props.setChecked(e.target.checked)}
      />
      <span className="toggleContainer"></span>
      {props.children ? (
        <span className="toggleLabel">{props.children}</span>
      ) : null}
    </label>
  );
}
