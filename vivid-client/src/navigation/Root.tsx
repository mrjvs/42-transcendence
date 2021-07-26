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
import { FriendsModal } from '../components/styled/modals/Friends.modal';
import { ChannelSettingsView } from '../views/ChannelSettingsView';
import { ChannelsContext } from '../hooks/useChannels';
import { LoadingView } from '../views/LoadingView';
import { DmChannelView } from '../views/DmChannelView';
import { GameMatchView } from '../views/GameMatch';
import { LadderMatchView } from '../views/LadderMatch';
import { MatchHistoryView } from '../views/MatchHistoryView';
import { StatisticsView } from '../views/StatisticsView';
import { ChannelsModal } from '../components/styled/modals/Channels.modal';

function SideBarRouter() {
  const userData = React.useContext(UserContext);
  const [friendsOpen, setFriendsOpen] = React.useState(false);
  const [channelsOpen, setChannelsOpen] = React.useState(false);
  const channelsData = React.useContext(ChannelsContext);

  const joinedChannels = channelsData.channels
    .filter((v: any) => {
      return !!v?.data?.joined_users?.find((u: any) => {
        return userData?.user?.id && u.user === userData.user.id && u.is_joined;
      });
    })
    .filter((v: any) => !v?.data?.dmId)
    .map((v: any) => v?.data);

  const friendRequestLen = userData.user.friends?.filter(
    (v: any) => !v.accepted && v.requested_by !== userData.user.id,
  ).length;

  return (
    <div className="wrapper">
      <FriendsModal
        open={friendsOpen}
        userData={userData}
        close={() => setFriendsOpen(false)}
      />
      <ChannelsModal open={channelsOpen} close={() => setChannelsOpen(false)} />
      <nav className="sideNav">
        <div className="top">
          <Heading size="small">Vivid</Heading>
        </div>
        <ActionRow label="Games" />
        <SidebarLink link="/" icon="crown">
          Play a game
        </SidebarLink>
        <SidebarLink link="/history" icon="trophy">
          Match history
        </SidebarLink>
        <SidebarLink link="/stats" icon="stats">
          Statistics
        </SidebarLink>
        <ActionRow label="channel">
          <Button
            small={true}
            type="secondary"
            onclick={() => setChannelsOpen(true)}
          >
            <Icon type="plus" />
            New
          </Button>
        </ActionRow>
        {joinedChannels.length === 0 ? (
          <>
            <SidebarLink
              click={() => alert('join')}
              icon="users"
              description="Make your life awesome by making a team"
            >
              Join a channel
            </SidebarLink>
            <SidebarLink
              click={() => alert('create')}
              icon="user_friends"
              description="Be the leader of the pack!"
            >
              Create a channel
            </SidebarLink>
          </>
        ) : null}
        {joinedChannels.map((v: any) => (
          <SidebarLink key={v.id} link={`/channel/${v.id}`}>
            {v.title}
          </SidebarLink>
        ))}
        <ActionRow label="friends">
          <Button
            badge={friendRequestLen > 0 ? friendRequestLen : undefined}
            small={true}
            type="secondary"
            onclick={() => setFriendsOpen(true)}
          >
            <Icon type="plus" />
            Friends
          </Button>
        </ActionRow>
        <Friends userData={userData} openModal={() => setFriendsOpen(true)} />
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
            <LoadingView>Not Found</LoadingView>
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
