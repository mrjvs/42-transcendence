import React from 'react';

export const ChannelsContext = React.createContext<any>([]);
ChannelsContext.displayName = 'ChannelsContext';

export function useChannelsContext() {
  const [channels, setChannels] = React.useState<any[]>([]);

  function addChannel(channel: any) {
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
      return list;
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
  };
}
