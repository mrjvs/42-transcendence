import React from 'react';
import { Heading } from '../../components/styled/Heading';
import { UserDropdown } from '../../components/styled/UserDropdown';
import './MainLayout.css';

export function MainLayout(props: {
  children: any;
  title: string;
  actions?: any;
}) {
  return (
    <div className="contentContainer">
      <div className="contentHeader">
        <Heading size="small">
          {props.title} {props.actions ? <span>{props.actions}</span> : null}
        </Heading>
        <UserDropdown />
      </div>
      <div className="channelWrapper">{props.children}</div>
    </div>
  );
}
