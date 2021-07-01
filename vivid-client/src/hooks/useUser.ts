import React from 'react';

export const UserContext = React.createContext<any>(null);

export function useUser() {
  const [user, setUser] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [isLoggedIn, setLoggedIn] = React.useState(false);

  function fetchUser() {
    setLoading(true);
    setError(false);
    setDone(false);
    fetch(window._env_.VIVID_BASE_URL + '/api/v1/users/@me', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((result) => {
        if (
          result.statusCode !== undefined &&
          result.statusCode !== 200 &&
          result.statusCode !== 401
        )
          throw new Error('failed fetch');
        if (result.statusCode === 401) setLoggedIn(false);
        else setLoggedIn(true);
        setLoading(false);
        setUser(result);
        setDone(true);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }

  React.useEffect(() => {
    fetchUser();
  }, []);

  return {
    fetchUser,
    user,
    error,
    done,
    loading,
    isLoggedIn,
  };
}
