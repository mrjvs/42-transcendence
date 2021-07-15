import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button } from '../components/styled/Button';
import { Icon } from '../components/styled/Icon';
import { ChannelContext } from '../hooks/useChannel';
import './ChannelSettingsView.css';
import { useFetch } from '../hooks/useFetch';
import { TextInput } from '../components/styled/TextInput';

export function ChannelSettingsView() {
  const history = useHistory();
  const { id }: any = useParams();
  const channelData = React.useContext<any>(ChannelContext);

  return (
    <div className="channel-settings-view-wrapper">
      <Button type="secondary" onclick={() => history.push(`/channel/${id}`)}>
        <Icon type="left_arrow" />
        Back to channel
      </Button>
      <h1>Channel settings</h1>
      <ChannelSettingsCard channelData={channelData} />
      <ChannelModeratorCard channelData={channelData} />
      <ChannelPunishedMembersCard channelData={channelData} />
      <ChannelMembersCard channelData={channelData} />
    </div>
  );
}

function ChannelSettingsCard(props: { channelData: any }) {
  const [newestChannelName, setNewestChannelName] = React.useState('');
  const [channelName, setChannelName] = React.useState('');

  React.useEffect(() => {
    if (
      props.channelData?.channel?.name &&
      props.channelData.channel.name !== newestChannelName
    ) {
      setChannelName(props.channelData.channel.name);
      setNewestChannelName(props.channelData.channel.name);
    }
  }, [newestChannelName, props.channelData]);

  const updateChannelFetch = useFetch({
    url: '',
    method: 'PATCH',
  });

  return (
    <div>
      <h2>test</h2>
      <div className="text-wrapper">
        <TextInput
          value={channelName}
          set={setChannelName}
          placeholder="Best Channel Ever"
          label="Channel name"
          noPadding
        />
      </div>
      <div className="security-settings">
        <h2>Security settings</h2>
      </div>
      <Button
        less_padding
        loading={updateChannelFetch.loading}
        onclick={() =>
          updateChannelFetch.run(
            channelName,
            `/api/v1/channels/${props.channelData.channel.id}`,
          )
        }
      >
        Save settings
      </Button>
      {updateChannelFetch.error &&
      updateChannelFetch.error?.data?.code === 'inuse' ? (
        <p>That username is already in use</p>
      ) : updateChannelFetch.error &&
        updateChannelFetch.error?.res?.status === 400 ? (
        <p>Username must be at least 1 character</p>
      ) : updateChannelFetch.error ? (
        <p>Something went wrong, try again later</p>
      ) : null}
    </div>
  );
}

function ChannelModeratorCard(props: { channelData: any }) {
  return (
    <div>
      <ul>
        {props.channelData?.channel.users.map((v: any) => (
          <li key={v}>
            {v.name}
            <Button type="danger" onclick={() => true}>
              Remove moderator
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChannelPunishedMembersCard(props: { channelData: any }) {
  return (
    <div>
      <ul>
        {props.channelData?.channel.users.map((v: any) => (
          <li key={v}>
            {v.name}
            <Button type="secondary" onclick={() => true}>
              Unban
            </Button>
            <Button type="danger" onclick={() => true}>
              Unmute
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChannelMembersCard(props: { channelData: any }) {
  return (
    <div>
      <ul>
        {props.channelData?.channel.users.map((v: any) => (
          <li key={v}>
            {v.name}
            <Button type="secondary" onclick={() => true}>
              Make mod
            </Button>
            <Button type="danger" onclick={() => true}>
              Mute
            </Button>
            <Button type="danger" onclick={() => true}>
              Ban
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
