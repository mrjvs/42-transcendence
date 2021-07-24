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
import { ChannelSettingsView } from '../views/ChannelSettingsView';
import { ChannelsContext } from '../hooks/useChannels';
import { NotFoundView } from '../views/NotFoundView';
import { DmChannelView } from '../views/DmChannelView';
import { GameMatchView } from '../views/GameMatch';
import { LadderMatchView } from '../views/LadderMatch';
import { MatchHistoryView } from '../views/MatchHistoryView';
import { StatisticsView } from '../views/StatisticsView';

function SideBarRouter() {
  const userData = React.useContext(UserContext);
  const channelsData = React.useContext(ChannelsContext);

  const joinedChannels = channelsData.channels
    .filter((v: any) => {
      return !!v?.data?.joined_users?.find((u: any) => {
        return userData?.user?.id && u.user === userData.user.id && u.is_joined;
      });
    })
    .filter((v: any) => !v?.data?.dmId)
    .map((v: any) => v?.data);

  return (
    <div className="wrapper">
      <nav className="sideNav">
        <div className="top">
          <Heading size="small">Vivid</Heading>
        </div>
        <ActionRow label="Games" />
        <SidebarLink link="/">
          <Icon type="crown" />
          Play a game
        </SidebarLink>
        <SidebarLink link="/history">
          <Icon type="trophy" />
          Match history
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
        {joinedChannels.map((v: any) => (
          <SidebarLink key={v.id} link={`/channel/${v.id}`}>
            {v.title}
          </SidebarLink>
        ))}
      </nav>
      <div className="content">
        <Switch>
          <Route exact path="/">
            <GameMatchView />
          </Route>
          <Route exact path="/history">
            <MatchHistoryView />
          </Route>
          <Route exact path="/stats">
            <StatisticsView />
          </Route>
          <Route exact path="/channel/:id">
            <ChannelView />
          </Route>
          <Route exact path="/dm/:id">
            <DmChannelView />
          </Route>
          <Route exact path="/pong">
            <p>pong</p>
            <GameView />
          </Route>
          <Route path="*">
            <NotFoundView>Not Found</NotFoundView>
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
          <Route exact path="/ladder/:id">
            <LadderMatchView />
          </Route>
          <Route exact path="/pong/:id">
            <PongView />
          </Route>
          <Route exact path="/channel/:id/settings">
            <ChannelSettingsView />
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
