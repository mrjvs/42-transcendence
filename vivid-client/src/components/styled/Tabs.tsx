import React from 'react';
import './Tabs.css';

export function TabsModal(props: {
  set: (value: string) => void;
  value: string;
  tabs: { name: string; value: string }[];
}) {
  return (
    <div className="tabs-wrapper">
      {props.tabs.map((v: any) => (
        <div
          className={`tabs-item ${props.value === v.value ? 'active' : ''}`}
          key={v.value}
          onClick={() => props.set(v.value)}
        >
          {v.name}
        </div>
      ))}
      <hr className="tabs-hr" />
    </div>
  );
}
