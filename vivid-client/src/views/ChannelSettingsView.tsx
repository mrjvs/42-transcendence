import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '../components/styled/Button';
import { Icon } from '../components/styled/Icon';
import { ChannelContext } from '../hooks/useChannel';
import './ChannelSettingsView.css';

export function ChannelSettingsView() {
  const history = useHistory();
  const channelData = React.useContext<any>(ChannelContext);

  return (
    <div className="settings-view-wrapper">
      <Button type="secondary" onclick={() => history.push('/')}>
        <Icon type="left_arrow" />
        Back to channel
      </Button>
      <h1>User settings</h1>
      <ChannelSettingsCard channelData={channelData} />
      <ChannelMembersCard rolesCard channelData={channelData} />
      <ChannelMembersCard punishCard channelData={channelData} />
      <ChannelMembersCard channelData={channelData} />
    </div>
  );
}

function ChannelSettingsCard(props: { channelData: any }) {
  return <div></div>;
}

function ChannelMembersCard(props: {
  channelData: any;
  rolesCard?: boolean;
  punishCard?: boolean;
}) {
  return <div></div>;
}
