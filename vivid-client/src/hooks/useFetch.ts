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
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  function run(body?: any) {
    setLoading(true);
    setError(false);
    fetch(`${window._env_.VIVID_BASE_URL}${options.url}`, {
      credentials: 'include',
      method: options.method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (res.status < 200 || res.status > 299)
          throw new Error('Wrong status code');
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
        setDone(true);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }

  React.useEffect(() => {
    if (options.runOnLoad) run();
  }, []);

  return {
    loading,
    error,
    done,
    run,
    data,
  };
}
