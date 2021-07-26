import React from 'react';
import { useHistory } from 'react-router-dom';
import { SocketContext } from '../../hooks/useWebsocket';
import { Button } from './Button';
import './LoadingScreen.css';
import { TextInput } from './TextInput';

const lines = [
  'Calculating the\nfourth dimension',
  'Scanning node_modules\nfolder size',
  'Reaching 88 mph',
  'Looking for\nnorminette updates',
  "Testing GLADoS'\nslow clap processor",
  'Hacking into\nthe mainframe',
  'Finding generic\nloading screen joke',
];

function LoginButtons() {
  const enabledMethods = ['INTRA', 'DISCORD']
    .map((v) => ({ name: v, env: window._env_[`VIVID_AUTH_${v}`] }))
    .filter((v) => v.env === 'true');
  const [loading, setLoading] = React.useState<string[]>([]);

  function getText(method: string) {
    if (method === 'INTRA') return 'Log in with 42 intra';
    if (method === 'DISCORD') return 'Log in with discord';
    return 'Log in';
  }

  if (enabledMethods.length == 0) {
    return (
      <div className="login-buttons">
        <p>
          Whoops, no enabled login methods
          <br />
          to choose from
        </p>
      </div>
    );
  }

  return (
    <div className="login-buttons">
      {enabledMethods.map((v: any, i: number) => (
        <Button
          key={v.name}
          loading={loading.includes(v.name)}
          type={i == 0 ? 'primary' : 'secondary'}
          onclick={() => {
            window.location.href = `${
              window._env_.VIVID_BASE_URL
            }/api/v1/auth/login/${v.name.toLowerCase()}`;
            setLoading((p: any) => {
              if (p.includes(v.name)) return p;
              return [...p, v.name];
            });
          }}
        >
          {getText(v.name)}
        </Button>
      ))}
    </div>
  );
}

export function LoadingScreen(props: any) {
  const { client, connect, hasConnected, clientError } =
    React.useContext(SocketContext);
  const [loading, setLoading] = React.useState(true);
  const [line, setLine] = React.useState('');
  const [tokenInput, setTokenInput] = React.useState('');
  const history = useHistory();

  // show random loading text
  React.useEffect(() => {
    setLine(lines[Math.floor(Math.random() * lines.length)]);
  }, []);

  // connect to socket once user has been requested and is logged in
  React.useEffect(() => {
    if (props.userData.userState.done && !props.userData.user.name)
      history.push('/');
    if (props.userData.userState.done && props.userData.isLoggedIn && !client) {
      connect();
    }
  }, [props.userData]);

  // show loading screen for at least 2 seconds. so not everything is flashing on load
  React.useEffect(() => {
    const time = setTimeout(() => setLoading(false), 2000);
    return () => {
      clearTimeout(time);
    };
  }, []);

  // error connecting to api
  if ((props.userData.userState.error || clientError) && !loading)
    return (
      <div className="loading-screen">
        <div className="overlay" />
        <div className="login-card">
          <div className="icon" />
          <h1 className="title">Failed to load</h1>
          <p className="text">Click the button below to try again</p>
          <Button onclick={() => window.location.reload()}>Retry load</Button>
        </div>
      </div>
    );

  // needs twofactor
  if (props.userData.userState.needsToken && !loading) {
    return (
      <div className="loading-screen">
        <div className="overlay" />
        <div className="login-card">
          <div className="icon" />
          <h1 className="title">Two factor authentication</h1>
          <p className="text">Put in your one time password to login</p>
          <div style={{ marginBottom: '2rem', width: '100%' }}>
            <TextInput
              value={tokenInput}
              lighter={true}
              set={setTokenInput}
              placeholder="Code here..."
            />
          </div>
          <Button
            loading={props.userData.tokenState.loading}
            onclick={() => props.userData.sendToken(tokenInput)}
          >
            Submit
          </Button>
          {props.userData.tokenState.invalidToken ? (
            <p>Token is invalid, try again with a different token</p>
          ) : props.userData.tokenState.error ? (
            <p>Something went wrong, try again later</p>
          ) : null}
        </div>
      </div>
    );
  }

  // not logged in
  if (props.userData.userState.done && !props.userData.isLoggedIn && !loading) {
    return (
      <div className="loading-screen">
        <div className="overlay" />
        <div className="login-card">
          <div className="icon" />
          <h1 className="title">You&apos;re not logged in</h1>
          <p className="text">
            Click the button below to continue to the login page
          </p>
          <LoginButtons />
        </div>
      </div>
    );
  }

  // loading
  if (props.userData.userState.loading || !hasConnected || loading)
    return (
      <div className="loading-screen">
        <div className="overlay" />
        <div className="icon-wrapper">
          <div className="icon" />
          <p className="text">
            {line.split('\n').map((v, i) => (
              <span key={i}>
                {v}
                <br />
              </span>
            ))}
          </p>
        </div>
      </div>
    );

  // not done, shouldnt happen
  if (!props.userData.userState.done || !hasConnected) return null;

  // normal state, render like normal
  return <div>{props.children}</div>;
}
