import React from 'react';
import { SocketContext } from './useWebsocket';

export const MessageContext = React.createContext<any>([]);
MessageContext.displayName = 'MessageContext';

export function useMessages(channel: string) {
  const [channelInfo, setChannelInfo] = React.useState<any>(null);
  const [channelMessages, setMessages] = React.useState<any[]>([]);
  const { messages, setChannelMessages, getChannelMessages } =
    React.useContext(MessageContext);

  const [error, setError] = React.useState(false);
  const [isLoading, setLoading] = React.useState(true);
  const [done, setDone] = React.useState(false);

  function requestMessages() {
    setLoading(true);
    setError(false);
    setDone(false);
    fetch(
      `${window._env_.VIVID_BASE_URL}/api/v1/channels/${channel}/messages`,
      {
        credentials: 'include',
      },
    )
      .then((res) => res.json())
      .then((result) => {
        setChannelMessages(channel, result);
        return fetch(
          `${window._env_.VIVID_BASE_URL}/api/v1/channels/${channel}`,
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

  React.useEffect(() => {
    setMessages([...getChannelMessages(channel)]);
  }, [messages]);

  function sendMessage(text: string) {
    fetch(
      `${window._env_.VIVID_BASE_URL}/api/v1/channels/${channel}/messages`,
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
    messages: channelMessages,
    channelInfo,
    messageState: {
      error,
      loading: isLoading,
      done,
    },
    sendMessage,
  };
}

export function useMessageContext() {
  const { client } = React.useContext(SocketContext);
  const [messages, setMessages] = React.useState<any[]>([]);

  function onMessage(data: any) {
    setMessages((prev) => {
      const list = [...prev];
      let found = list.find((v) => v.id === data.channel);
      if (!found) {
        found = {
          id: data.channel,
          messages: [],
        };
        list.push(found);
      }
      found.messages.push(data);
      return list;
    });
  }

  function setChannelMessages(channelId: string, messages: any[]) {
    setMessages((prev) => {
      const list = [...prev];
      let found = list.find((v) => v.id === channelId);
      if (!found) {
        found = {
          id: channelId,
          messages: [],
        };
        list.push(found);
      }
      found.messages = messages;
      return list;
    });
  }

  function getChannelMessages(channelId: string) {
    const found = messages.find((v) => v.id === channelId);
    if (!found) return [];
    return found.messages;
  }

  React.useEffect(() => {
    if (client) client.on('channel_message', onMessage);
    return () => {
      if (client) client.off('channel_message', onMessage);
    };
  }, [client]);

  return {
    messages,
    setChannelMessages,
    getChannelMessages,
  };
}
