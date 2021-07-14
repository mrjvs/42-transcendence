import React from 'react';

export const ChannelContext = React.createContext<any>(null);

export function useChannel() {
  const [channel, setChannel] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [done, setDone] = React.useState(false);

  function fetchChannel() {
    setLoading(true);
    setError(false);
    setDone(false);
    fetch(`${window._env_.VIVID_BASE_URL}/api/v1/channels/`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((channel) => {
        setChannel(channel);
        setLoading(false);
        setDone(true);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }

  React.useEffect(() => {
    fetchChannel();
  }, []);

  return {
    fetchChannel,
    channel,
    error,
    done,
    loading,
  };
}
