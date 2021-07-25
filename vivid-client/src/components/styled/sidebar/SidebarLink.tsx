import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../Icon';
import './SidebarLink.css';

export function SidebarLink(props: {
  link?: string;
  click?: () => void;
  icon?: string;
  children: any;
  description?: string;
}) {
  const content = (
    <div className="sidebar-content-wrapper">
      <div className={`sidebar-icon ${props.description ? 'big' : ''}`}>
        {props.icon ? <Icon type={props.icon} /> : null}
      </div>
      <div>
        <p className={`sidebar-name ${props.description ? 'bold' : ''}`}>
          {props.children}
        </p>
        {props.description ? (
          <span className="sidebar-description">{props.description}</span>
        ) : null}
      </div>
    </div>
  );

  if (props.link) {
    return (
      <NavLink className="sidebar-link" to={props.link} exact>
        {content}
      </NavLink>
    );
  }

  if (props.click) {
    return (
      <div
        className={`sidebar-link ${props.description ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          props.click?.();
        }}
      >
        {content}
      </div>
    );
  }

  return null;
}
