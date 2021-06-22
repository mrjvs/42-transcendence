import React from 'react';
import './MessageBox.css';

export function MessageBox(props: {
  placeholder: string;
  disabled: boolean;
  onSend: (text: string) => void;
}) {
  const [content, setContent] = React.useState('');

  function onChange(event: any) {
    setContent(event.target.value);
  }

  function onSubmit(event: any) {
    event.preventDefault();
    props.onSend(content);
    setContent('');
  }

  return (
    <form className="messageBox" onSubmit={onSubmit}>
      <input
        onChange={onChange}
        value={content}
        type="text"
        disabled={props.disabled}
        placeholder={props.placeholder}
      />
    </form>
  );
}
