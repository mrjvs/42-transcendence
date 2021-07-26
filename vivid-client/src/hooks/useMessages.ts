import React from 'react';
import { useHistory } from 'react-router-dom';
import { ChannelsContext } from './useChannels';
import { UserContext } from './useUser';
import { UsersContext } from './useUsers';
import { SocketContext } from './useWebsocket';

export const MessageContext = React.createContext<any>([]);
MessageContext.displayName = 'MessageContext';

export function useMessages(channel: string) {
  const { addChannel, getChannel, channels } =
    React.useContext(ChannelsContext);
  const [channelMessages, setMessages] = React.useState<any[]>([]);
  const { messages, setChannelMessages, getChannelMessages } =
    React.useContext(MessageContext);
  const history = useHistory();
  const { getUser, users } = React.useContext(UsersContext);

  const userData = React.useContext(UserContext);
  const [currentChannelUser, setCurrentChannelUser] = React.useState<{
    user: any;
    tag: any;
  }>({ user: null, tag: null });

  const channelInfo = getChannel(channel);

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
      .then(async (res) => ({ res: res, data: await res.json() }))
      .then((result) => {
        if (result.res.status >= 400) throw new Error('failed to fetch');
        setChannelMessages(channel, result.data);
        return fetch(
          `${window._env_.VIVID_BASE_URL}/api/v1/channels/${channel}`,
          {
            credentials: 'include',
          },
        );
      })
      .then(async (res) => ({ res: res, data: await res.json() }))
      .then((info) => {
        if (info.res.status >= 400) throw new Error('failed to fetch');
        addChannel(info.data);
        setLoading(false);
        setDone(true);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
        setDone(true);
      });
  }

  function getRole(userId: string) {
    if (!userId) return null;
    let tag = null;
    const channelUser = channelInfo?.joined_users?.find(
      (v: any) => v.user === userId,
    );
    if (channelUser && channelUser.is_mod) tag = 'mod';
    if (userId === channelInfo?.owner) tag = 'owner';
    return tag;
  }

  React.useEffect(() => {
    if (!channelInfo || !userData.user?.id) {
      setCurrentChannelUser({ user: null, tag: null });
      return;
    }
    const n = {
      user: channelInfo?.joined_users?.find(
        (v: any) => v.user === userData.user?.id,
      ),
      tag: getRole(userData.user?.id),
    };
    setCurrentChannelUser(n);
  }, [channels, channelInfo, userData]);

  React.useEffect(() => {
    if (channel) requestMessages();
  }, [channel]);

  React.useEffect(() => {
    setMessages([...getChannelMessages(channel)]);
  }, [messages]);

  function sendMessage(text: string, type: boolean, extraData?: any) {
    if (type) {
      fetch(
        `${window._env_.VIVID_BASE_URL}/api/v1/channels/${channel}/messages/duel`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(extraData),
          credentials: 'include',
        },
      )
        .then((v) => v.json())
        .then((data) => {
          // if game id is set, go to game view
          if (data?.aux_content?.invite_game_id)
            history.push(`/pong/${data.aux_content.invite_game_id}`);
        });
    } else {
      let extra = '';
      if (text.trim() === 'partyparrot') extra = '/secret';
      fetch(
        `${window._env_.VIVID_BASE_URL}/api/v1/channels/${channel}/messages${extra}`,
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
  }

  return {
    channels,
    messages: channelMessages,
    channelInfo: getChannel(channel),
    updateChannelInfo(obj: any) {
      addChannel({
        ...obj,
        id: channel,
      });
    },
    getUser,
    users,
    currentChannelUser,
    getRole,
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
  const { addUser } = React.useContext(UsersContext);
  const [messages, setMessages] = React.useState<any[]>([]);

  function onMessage(data: any) {
    const message = data.message;
    addUser(data.user);
    setMessages((prev) => {
      const list = [...prev];
      let found = list.find((v) => v.id === message.channel);
      if (!found) {
        found = {
          id: message.channel,
          messages: [],
        };
        list.push(found);
      }
      const foundMatch = found.messages.find((v: any) => v.id === message.id);
      if (!foundMatch) found.messages.push(message);
      return list;
    });
  }

  function deleteMessage({ channelId, messageId }: any) {
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
      found.messages = found.messages.filter((v: any) => v.id !== messageId);
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
    if (client) {
      client.on('channel_message', onMessage);
      client.on('delete_channel_message', deleteMessage);
    }
    return () => {
      if (client) {
        client.off('channel_message', onMessage);
        client.off('delete_channel_message', deleteMessage);
      }
    };
  }, [client]);

  return {
    messages,
    setChannelMessages,
    getChannelMessages,
  };
}
