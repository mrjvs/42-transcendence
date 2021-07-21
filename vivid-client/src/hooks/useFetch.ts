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

  function run(body?: any, overwriteUrl?: string) {
    setLoading(true);
    setError(null);
    let u = options.url;
    if (overwriteUrl) u = overwriteUrl;
    let b = undefined;
    let isJson = true;
    if (body && body.constructor === FormData) {
      b = body;
      isJson = false;
    } else if (body) b = JSON.stringify(body);
    fetch(`${window._env_.VIVID_BASE_URL}${u}`, {
      credentials: 'include',
      method: options.method,
      body: b,
      headers: isJson ? { 'Content-Type': 'application/json' } : {},
    })
      .then((res) => {
        if (
          !res.headers.has('content-length') ||
          res.headers.get('content-length') === '0'
        )
          return new Promise<any>((resolve) => {
            resolve({});
          }).then((data) => ({ data, res }));
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
