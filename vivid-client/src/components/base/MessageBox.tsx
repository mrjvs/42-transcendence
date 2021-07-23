import React from 'react';
import './MessageBox.css';
import { Button } from '../styled/Button';
import { Icon } from '../styled/Icon';

export function MessageBox(props: {
  placeholder: string;
  disabled: boolean;
  onSend: (obj: { text: string; type: boolean }) => void;
}) {
  const [content, setContent] = React.useState('');

  function onChange(event: any) {
    setContent(event.target.value);
  }

  function onSubmit(event?: any, duel = false) {
    if (event) event.preventDefault();
    props.onSend({ text: content, type: duel });
    setContent('');
  }

  return (
    <div className="messageRow">
      <Button type="duel" loading={false} onclick={() => onSubmit(null, true)}>
        <Icon type="gamepad" />
      </Button>
      <form className="messageBox" onSubmit={(e) => onSubmit(e, false)}>
        <input
          onChange={onChange}
          value={content}
          type="text"
          disabled={props.disabled}
          placeholder={props.placeholder}
        />
      </form>
    </div>
  );
}
