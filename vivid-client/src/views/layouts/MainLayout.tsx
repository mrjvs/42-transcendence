import React from 'react';
import { Heading } from '../../components/styled/Heading';
import { UserDropdown } from '../../components/styled/UserDropdown';
import './MainLayout.css';

export function MainLayout(props: {
  children: any;
  title: string;
  actions?: any;
  background?: string;
}) {
  return (
    <div className="contentContainer">
      <div
        className={`contentHeader`}
        style={{
          backgroundColor: props.background,
        }}
      >
        <div className="items">
          <Heading size="small">{props.title}</Heading>
          {props.actions ? <span>{props.actions}</span> : null}
        </div>
        <UserDropdown color={props.background} />
      </div>
      <div className="channelWrapper">{props.children}</div>
    </div>
  );
}
