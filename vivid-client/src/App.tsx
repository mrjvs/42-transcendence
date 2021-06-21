import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import './App.css';
import { ChannelView } from './views/channel';

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
            </ul>
          </nav>
          <Switch>
            <Route path="/about">
              <About />
            </Route>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/channel/:id">
              <ChannelView />
            </Route>
            <Route path="*">
              <NotFound />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
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
