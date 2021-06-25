import React from 'react';
import { NavLink } from 'react-router-dom';
import './SidebarLink.css';

export function SidebarLink(props: { link: string; children: any }) {
  return (
    <NavLink className="sidebar-link" to={props.link}>
      {props.children}
    </NavLink>
  );
}
