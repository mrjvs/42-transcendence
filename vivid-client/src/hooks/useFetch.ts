import React from 'react';

export function useFetch(options: {
  runOnLoad?: boolean;
  url: string;
  method?: string;
}) {
  options = {
    runOnLoad: false,
    method: 'GET',
    ...options,
  };

  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  function run(body?: any) {
    setLoading(true);
    setError(null);
    fetch(`${window._env_.VIVID_BASE_URL}${options.url}`, {
      credentials: 'include',
      method: options.method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        return res.json().then((data) => ({ data, res }));
      })
      .then((data) => {
        if (data.res.status < 200 || data.res.status > 299) throw data;
        setData(data);
        setLoading(false);
        setDone(true);
      })
      .catch((err) => {
        setLoading(false);
        setError(err);
      });
  }

  React.useEffect(() => {
    if (options.runOnLoad) run();
  }, []);

  function reset() {
    setData(null);
    setError(null);
    setLoading(false);
    setDone(false);
  }

  return {
    loading,
    error,
    done,
    run,
    data,
    reset,
  };
}
