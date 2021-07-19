import React from 'react';
import { UsersContext } from './useUsers';
import { SocketContext } from './useWebsocket';

export const ChannelsContext = React.createContext<any>([]);
ChannelsContext.displayName = 'ChannelsContext';

export function useChannelsContext() {
  const { addUser } = React.useContext(UsersContext);
  const [channels, setChannels] = React.useState<any[]>([]);

  function addChannel(channel: any) {
    const users: any[] = [];
    setChannels((prev) => {
      const list = [...prev];
      let found = list.find((v) => v.id === channel.id);
      if (!found) {
        found = {
          data: channel,
          id: channel.id,
        };
        list.push(found);
      }
      found.data = { ...found.data, ...channel };
      if (!found?.data?.joined_users) found.data.joined_users = [];
      found.data.joined_users = found.data.joined_users.map((v: any) => {
        if (v.user.constructor !== String) {
          users.push(v.user);
          return {
            ...v,
            user: v.user.id,
          };
        }
        return v;
      });
      return list;
    });
    users.forEach((v) => addUser(v));
  }

  function updateChannel(channelId: string, cb: (data: any) => any) {
    const users: any[] = [];
    setChannels((prev) => {
      const list = [...prev];
      let found = list.find((v) => v.id === channelId);
      if (!found) {
        found = {
          data: {},
          id: channelId,
        };
        list.push(found);
      }
      found.data = cb(found.data);
      if (!found?.data?.joined_users) found.data.joined_users = [];
      found.data.joined_users = found.data.joined_users.map((v: any) => {
        if (v.user.constructor !== String) {
          addUser(v.user);
          return {
            ...v,
            user: v.user.id,
          };
        }
        return v;
      });
      return list;
    });
    users.forEach((v) => addUser(v));
  }

  function removeChannel(channelId: string) {
    setChannels((prev) => {
      return prev.filter((v) => v.id !== channelId);
    });
  }

  function getChannel(channelId: string) {
    const found = channels.find((v) => v.id === channelId);
    if (!found) return false;
    return found.data;
  }

  return {
    channels,
    addChannel,
    getChannel,
    updateChannel,
    removeChannel,
  };
}

export function ChannelClientListener(props: { children: any }) {
  const { updateChannel, removeChannel } = React.useContext(ChannelsContext);
  const { client } = React.useContext(SocketContext);

  // events
  function updateUser(userData: any) {
    updateChannel(userData.channelId, (channel: any) => {
      if (!channel.joined_users) channel.joined_users = [];
      let foundUser = channel.joined_users.find(
        (v: any) => v.user === userData.id,
      );
      if (!foundUser) {
        foundUser = {};
        channel.joined_users.push(foundUser);
      }
      Object.assign(foundUser, {
        user: userData.id,
        is_muted: userData.muted,
        is_mod: userData.mod,
        is_banned: userData.banned,
        is_joined: userData.joined,
      });
      return channel;
    });
  }

  function updateChan(channelData: any) {
    updateChannel(channelData.channelId, (channel: any) => {
      return {
        ...channel,
        ...channelData.channel,
      };
    });
  }

  function removeChan(channelData: any) {
    removeChannel(channelData.channelId);
  }

  React.useEffect(() => {
    if (client) {
      client.on('channel_user_update', updateUser);
      client.on('channel_update', updateChan);
      client.on('delete_channel', removeChan);
    }
    return () => {
      if (client) {
        client.off('channel_user_update', updateUser);
        client.off('channel_update', updateChan);
        client.off('delete_channel', removeChan);
      }
    };
  }, [client]);

  return props.children;
}
