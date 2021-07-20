import { Route, Switch, useHistory } from 'react-router-dom';
import React from 'react';
import './Root.css';
import { Heading } from '../components/styled/Heading';
import { Button } from '../components/styled/Button';
import { Icon } from '../components/styled/Icon';
import { ActionRow } from '../components/styled/sidebar/ActionRow';
import { SidebarLink } from '../components/styled/sidebar/SidebarLink';
import { ChannelView } from '../views/ChannelView';
import { UserContext } from '../hooks/useUser';
import { SocketContext } from '../hooks/useWebsocket';
import { AccountSetupModal } from '../components/styled/modals/AccountSetup.modal';
import { PongView } from '../views/PongView';
import { SettingsView } from '../views/SettingsView';
import { GameView } from '../views/GameView';
import { Friends } from '../components/styled/sidebar/Friends';
import { FriendsModal } from '../components/styled/sidebar/FriendsModal';

function SideBarRouter() {
  const userData = React.useContext(UserContext);
  const [state, setState] = React.useState(false);

  return (
    <div className="wrapper">
      <nav className="sideNav">
        <div className="top">
          <Heading size="small">Vivid</Heading>
        </div>
        <ActionRow label="guild" />
        <SidebarLink link="/guilds">
          <Icon type="gear" />
          Guild Settings
        </SidebarLink>
        <SidebarLink link="/tournaments">
          <Icon type="flag" />
          Tournaments
        </SidebarLink>
        <SidebarLink link="/wars">
          <Icon type="award" />
          War History
        </SidebarLink>
        <SidebarLink link="/stats">
          <Icon type="stats" />
          Statistics
        </SidebarLink>
        <ActionRow label="channel">
          <Button
            badge={1}
            small={true}
            type="secondary"
            onclick={() => alert('hi')}
          >
            <Icon type="plus" />
            New
          </Button>
        </ActionRow>
        {userData.user.joined_channels.map((v: any) => (
          <SidebarLink key={v.channel.id} link={`/channel/${v.channel.id}`}>
            {v.channel.title}
          </SidebarLink>
        ))}

        <ActionRow label="friends">
          <Button
            badge={1}
            small={true}
            type="secondary"
            onclick={() => setState(true)}
          >
            Friends
          </Button>
          <FriendsModal
            open={state}
            user={userData}
            close={() => setState(false)}
          />
          <Icon type="plus" />
        </ActionRow>
        <Friends userId={userData.id} />
      </nav>
      <div className="content">
        <Switch>
          <Route exact path="/">
            <p>home</p>
          </Route>
          <Route exact path="/channel/:id">
            <ChannelView />
          </Route>
          <Route exact path="/pong">
            <p>pong</p>
            <GameView />
          </Route>
          <Route exact path="/pong/:id">
            <p>pong</p>
            <PongView />
          </Route>
          <Route path="*">
            <p>Not found</p>
          </Route>
        </Switch>
      </div>
    </div>
  );
}

function MainRouter() {
  const userData = React.useContext(UserContext);
  const [open, setOpen] = React.useState(false);
  const history = useHistory();

  React.useEffect(() => {
    if (userData.user && !userData.user.name) {
      history.push('/');
      setOpen(true);
    }
  }, [userData.user]);

  return React.useMemo(
    () => (
      <>
        <AccountSetupModal open={open} close={() => setOpen(false)} />
        <Switch>
          <Route exact path="/settings">
            <SettingsView />
          </Route>
          <Route path="*">
            <SideBarRouter />
          </Route>
        </Switch>
      </>
    ),
    [open],
  );
}

export function RootNavigation() {
  const socketData = React.useContext(SocketContext);

  return (
    <div className="wrapper-alert">
      {socketData.clientState !== 'CONNECTED' ? (
        <div className="alert">
          <Icon type="alert" className="icon" />
          Not connected to the Vivid servers
        </div>
      ) : null}
      <MainRouter />
    </div>
  );
}
