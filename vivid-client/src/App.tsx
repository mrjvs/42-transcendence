import React, { useEffect, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { UserContext, useUser } from './hooks/useUser';
import { RootNavigation } from './navigation/Root';

function UserProtect(props: any) {
  if (props.userData.done && !props.userData.isLoggedIn) {
    window.location.href = 'http://localhost:8080/api/v1/auth/login';
    return <p>You are not logged in</p>;
  }
  if (props.userData.error) return <p>Failed to log in</p>;
  if (props.userData.loading) return <p>Loading...</p>;
  if (!props.userData.done) return null;
  return <div>{props.children}</div>;
}

function App() {
  const userData = useUser();

  return (
    <UserContext.Provider value={userData}>
      <UserProtect userData={userData}>
        <RootNavigation />
      </UserProtect>
    </UserContext.Provider>
  );
}

interface IChannelList {
  id: string;
}

function Home() {
  const [error, setError] = useState(false);
  const [channelList, setChannelList] = useState<IChannelList[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/channels', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.statusCode !== undefined && result.statusCode !== 200)
          throw new Error('failed fetch');
        setLoading(false);
        setChannelList(result);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, []);

  let channelListRender;

  if (isLoading)
    channelListRender = (
      <div>
        <p>Loading...</p>
      </div>
    );
  else if (error)
    channelListRender = (
      <div>
        <p>Something went wrong, try again later</p>
      </div>
    );
  else
    channelListRender = (
      <div>
        <ul>
          {channelList.map((v) => (
            <li key={v.id}>
              <Link to={`/channel/${v.id}`}>{v.id}</Link>
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <header>
      <h1>Channel list:</h1>
      {channelListRender}
    </header>
  );
}

function About() {
  return (
    <div>
      <h2>About</h2>
      <p>Sample text</p>
    </div>
  );
}

function NotFound() {
  return (
    <div>
      <h2>Whoops</h2>
      <p>We couldn&lsquo;t find that page</p>
      <Link to="/">Back to home</Link>
    </div>
  );
}

export default App;
