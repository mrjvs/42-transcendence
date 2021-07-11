import React from 'react';
import { Heading } from '../../components/styled/Heading';
import { UserDropdown } from '../../components/styled/UserDropdown';
import './MainLayout.css';

export function MainLayout(props: { children: any; title: string }) {
  return (
    <div className="contentContainer">
      <div className="contentHeader">
        <Heading size="small">{props.title}</Heading>
        <UserDropdown />
      </div>
      <div className="channelWrapper">{props.children}</div>
    </div>
  );
}
