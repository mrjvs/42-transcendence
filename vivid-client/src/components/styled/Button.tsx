import React from 'react';
import './Button.css';

export function Button(props: {
  children: any;
  onclick?: () => void;
  badge?: number;
  small?: boolean;
  loading?: boolean;
  less_padding?: boolean;
  more_padding?: boolean;
  margin_right?: boolean;
  no_button?: boolean;
  type?:
    | 'primary'
    | 'secondary'
    | 'duel'
    | 'danger'
    | 'small-box'
    | 'secondary-small'
    | 'accept'
    | 'decline';
}) {
  const type = props.type || 'primary';
  const button_props = {
    className: `button-new ${props.small ? 'small' : ''} button-${type} ${
      props.less_padding ? 'button-less-padding' : ''
    } ${props.margin_right ? 'button-margin-right' : ''} ${
      props.more_padding ? 'button-more-padding' : ''
    }`,
    onClick: props.onclick ? props.onclick : () => true,
  };
  if (props.no_button)
    return (
      <div {...button_props}>
        {props.loading ? <div className="loader"></div> : null}
        {props.children}
        {props.badge !== undefined ? (
          <span className="badge">{props.badge}</span>
        ) : null}
      </div>
    );
  return (
    <button {...button_props}>
      {props.loading ? <div className="loader"></div> : null}
      {props.loading && ['accept', 'decline'].includes(props.type || '')
        ? null
        : props.children}
      {props.badge !== undefined ? (
        <span className="badge">{props.badge}</span>
      ) : null}
    </button>
  );
}
