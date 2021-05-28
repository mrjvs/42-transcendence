import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function InputBox(props: { channel: string; onSend: () => void }) {
  const [error, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  function sendMessage() {
    setLoading(true);
    setError(false);
    fetch(`http://localhost:8080/api/v1/channels/${props.channel}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: '4f166638-410b-419c-9aad-bb6306f80c10',
        content,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setLoading(false);
        setContent('');
        props.onSend();
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
    return false;
  }

  function onChange(event: any) {
    setContent(event.target.value);
  }

  function onSubmit(event: any) {
    event.preventDefault();
    sendMessage();
  }

  const buttonText = isLoading ? 'Sending...' : 'Send';
  let errorRender = <div></div>;
  if (error) errorRender = <p>Something went wrong, try again later</p>;

  return (
    <form onSubmit={onSubmit}>
      {errorRender}
      <input
        onChange={onChange}
        value={content}
        type="text"
        placeholder="hello world..."
      />
      <button>{buttonText}</button>
    </form>
  );
}

interface IMessage {
  id: string;
  content: string;
  user: string;
}
export function ChannelView() {
  const { id }: any = useParams();

  const [error, setError] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setLoading] = useState(true);

  function requestMessages() {
    setLoading(true);
    setError(false);
    fetch(`http://localhost:8080/api/v1/channels/${id}/messages`)
      .then((res) => res.json())
      .then((result) => {
        setLoading(false);
        setMessages(result);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }

  useEffect(() => {
    requestMessages();
  }, []);

  let messageRender;

  if (isLoading)
    messageRender = (
      <div>
        <p>Loading messages...</p>
      </div>
    );
  else if (error)
    messageRender = (
      <div>
        <p>Something went wrong, try again later</p>
      </div>
    );
  else
    messageRender = (
      <div>
        <ul>
          {messages.map((v) => (
            <li key={v.id}>
              <p>
                <b>{v.user}:</b> {v.content}
              </p>
              <hr />
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <div>
      {messageRender}
      <hr />
      <InputBox channel={id} onSend={requestMessages} />
    </div>
  );
}
