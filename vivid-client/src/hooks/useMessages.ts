import React from 'react';
import socketIOClient from 'socket.io-client';

export function useMessages(channel: string) {
  const [messages, setMessages] = React.useState<any[]>([]);
  const [clientState, setClientState] = React.useState('CONNECTING');
  const [channelInfo, setChannelInfo] = React.useState<any>(null);

  React.useEffect(() => {
    const client = socketIOClient(window._env_.VIVID_BASE_URL, {
      withCredentials: true,
      path: '/api/v1/events',
    });

    client.on('connect', () => {
      console.log('at useMessage');

      setClientState('CONNECTED');
    });

    client.on('channel_message', (data: any) => {
      if (data?.channel === channel) setMessages((prev) => [...prev, data]);
    });

    client.on('disconnect', () => {
      setClientState('DISCONNECTED');
    });

    return () => {
      client.destroy();
    };
  }, []);

  const [error, setError] = React.useState(false);
  const [isLoading, setLoading] = React.useState(true);
  const [done, setDone] = React.useState(false);

  function requestMessages() {
    setLoading(true);
    setError(false);
    setDone(false);
    fetch(
      window._env_.VIVID_BASE_URL + `/api/v1/channels/${channel}/messages`,
      {
        credentials: 'include',
      },
    )
      .then((res) => res.json())
      .then((result) => {
        setMessages(result);
        return fetch(
          window._env_.VIVID_BASE_URL + `/api/v1/channels/${channel}`,
          {
            credentials: 'include',
          },
        );
      })
      .then((res) => res.json())
      .then((info) => {
        setChannelInfo(info);
        setLoading(false);
        setDone(true);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
        setDone(true);
      });
  }

  React.useEffect(() => {
    requestMessages();
  }, [channel]);

  function sendMessage(text: string) {
    fetch(
      window._env_.VIVID_BASE_URL + `/api/v1/channels/${channel}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({
          content: text,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      },
    );
  }

  return {
    clientState,
    messages,
    channelInfo,
    messageState: {
      error,
      loading: isLoading,
      done,
    },
    sendMessage,
  };
}
