import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
            </ul>
          </nav>
          <Switch>
            <Route path="/about">
              <About />
            </Route>
            <Route exact path="/">
              <Home />
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

function Home() {
  return (
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Edit <code>src/App.tsx</code> and save to reload.
      </p>
      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn hello world
      </a>
      <p>Test env: {window._env_.VIVID_TEST_ENV}</p>
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
      <p>We couldn't find that page</p>
      <Link to="/">Back to home</Link>
    </div>
  );
}

export default App;
