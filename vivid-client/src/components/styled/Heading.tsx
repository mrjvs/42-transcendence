import React from 'react';
import './Heading.css';

export function Heading(props: { children: any; size: 'small' | 'big' }) {
  return <h1 className={`heading heading-${props.size}`}>{props.children}</h1>;
}
