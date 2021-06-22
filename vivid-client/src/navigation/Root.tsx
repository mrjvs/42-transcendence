import { Route, BrowserRouter, Switch } from 'react-router-dom';
import React from 'react';
import './Root.css';
import { Heading } from '../components/styled/Heading';
import { Button } from '../components/styled/Button';
import { Icon } from '../components/styled/Icon';
import { ActionRow } from '../components/styled/sidebar/ActionRow';
import { SidebarLink } from '../components/styled/sidebar/SidebarLink';
import { ChannelView } from '../views/ChannelView';
import { UserContext } from '../hooks/useUser';

export function RootNavigation() {
  const userData = React.useContext(UserContext);
  console.log(userData);
  return (
    <BrowserRouter>
      <div className="wrapper">
        <nav className="sideNav">
          <Heading size="big">Vivid</Heading>
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
            <Button badge={1} small={true} onclick={() => alert('ello')}>
              <Icon type="plus" />
              New
            </Button>
          </ActionRow>
          {userData.user.joined_channels.map((v: any) => (
            <SidebarLink key={v.channel.id} link={`/channel/${v.channel.id}`}>
              {v.channel.title}
            </SidebarLink>
          ))}
        </nav>
        <div className="content">
          <Switch>
            <Route exact path="/">
              <p>home</p>
            </Route>
            <Route exact path="/channel/:id">
              <ChannelView />
            </Route>
            <Route path="*">
              <p>Not found</p>
            </Route>
          </Switch>
        </div>
      </div>
    </BrowserRouter>
  );
}
