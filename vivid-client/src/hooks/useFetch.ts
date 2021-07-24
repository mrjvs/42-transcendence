import React from 'react';

export function useFetch(options: {
  runOnLoad?: boolean;
  url: string;
  method?: string;
}) {
  let shouldCancel = false;
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
    shouldCancel = false;
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
        return res.text().then((text) => {
          return {
            data: text.length > 0 ? JSON.parse(text) : {},
            res,
          };
        });
      })
      .then((data) => {
        if (shouldCancel) return;
        if (data.res.status >= 400) throw data;
        setData(data);
        setLoading(false);
        setDone(true);
      })
      .catch((err) => {
        if (shouldCancel) return;
        setLoading(false);
        setError(err);
      });
  }

  React.useEffect(() => {
    if (options.runOnLoad) run();
    return () => {
      shouldCancel = true;
    };
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
