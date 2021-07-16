import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button } from '../components/styled/Button';
import { Icon } from '../components/styled/Icon';
import './ChannelSettingsView.css';
import { useFetch } from '../hooks/useFetch';
import { TextInput } from '../components/styled/TextInput';
import { ToggleButton } from '../components/styled/Toggle';
import { Avatar } from '../components/styled/Avatar';
import { useMessages } from '../hooks/useMessages';

export function ChannelSettingsView() {
  const history = useHistory();
  const { id }: any = useParams();
  const { channelInfo, messageState, getRole } = useMessages(id);
  const channelProps = {
    channel: channelInfo,
    getRole,
  };

  if (messageState.loading) return <p>Loading...</p>;

  if (messageState.error) return <p>Failed to load</p>;

  return (
    <div className="channel-settings-view">
      <Button type="secondary" onclick={() => history.push(`/channel/${id}`)}>
        <Icon type="left_arrow" />
        Back to channel
      </Button>
      <h1>Channel settings</h1>
      <ChannelSettingsCard channelData={channelProps} />
      <h1>Channel moderators</h1>
      <ChannelModeratorCard channelData={channelProps} />
      <h1>Punished members</h1>
      <ChannelPunishedMembersCard channelData={channelProps} />
      <h1>All members</h1>
      <ChannelMembersCard channelData={channelProps} />
    </div>
  );
}

function ChannelSettingsCard(props: { channelData: any }) {
  const [newestChannelName, setNewestChannelName] = React.useState('');
  const [channelName, setChannelName] = React.useState('');
  const [password, setPassword] = React.useState('');

  const updatePassword = useFetch({
    url: '/api/v1/channels/',
    method: 'PATCH',
  });

  const updateChannelFetch = useFetch({
    url: '',
    method: 'PATCH',
  });

  React.useEffect(() => {
    if (
      props.channelData?.channel?.name &&
      props.channelData.channel.name !== newestChannelName
    ) {
      setChannelName(props.channelData.channel.name);
      setNewestChannelName(props.channelData.channel.name);
    }
  }, [newestChannelName, props.channelData]);

  React.useEffect(() => {
    if (updatePassword.done) {
      props.channelData?.addChannel({ password: password });
      updatePassword.reset();
    }
  }, [updatePassword.done]);

  return (
    <div className="channel-settings-wrapper card">
      <div className="channel-settings-expand">
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
          <h2>Security</h2>
          <ToggleButton>Public channel</ToggleButton>
          <ToggleButton>Password protected</ToggleButton>
        </div>
        <div className="text-wrapper">
          <TextInput
            value={password}
            set={setPassword}
            placeholder="Password is hidden"
            label="Password"
            noPadding
          />
          <Button
            loading={updatePassword.loading}
            type="secondary"
            onclick={() => updatePassword.run()}
          >
            Change Password
          </Button>
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
      <div className="info-card">
        <h2>test</h2>
        <p>15 members</p>
        <div>
          <Icon type="check" />
          Public channel
        </div>
        <div>
          <Icon type="check" />
          Password protected
        </div>
      </div>
    </div>
  );
}

function ChannelModeratorCard(props: { channelData: any }) {
  console.log(props.channelData.channel);
  const [active, setActive] = React.useState(false);
  const [selected, setSelected] = React.useState<any>(null);

  return (
    <div className="card">
      <ul>
        {props.channelData?.channel.joined_users.map((v: any) => (
          <li
            className={`${active ? 'active' : null}`}
            key={v.id}
            onClick={() => setActive(true)}
          >
            <div className="user">
              <Avatar noStatus small user={v.user} />
              <span>
                {v.user.name}
                {v.is_mod ? <span className="tag">mod</span> : null}
              </span>
            </div>
            <div>
              {active ? (
                <Button type="danger" onclick={() => true}>
                  Remove moderator
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChannelPunishedMembersCard(props: { channelData: any }) {
  return (
    <div className="card">
      <ul>
        {props.channelData?.channel.joined_users.map((v: any) => (
          <li key={v.id}>
            <div className="user">
              <Avatar noStatus small user={v.user} />
              {v.user.name}
            </div>
            <div>
              <Button type="secondary" onclick={() => true}>
                Unban
              </Button>
              <Button type="danger" onclick={() => true}>
                Unmute
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChannelMembersCard(props: { channelData: any }) {
  return (
    <div className="card">
      <ul>
        {props.channelData?.channel.joined_users.map((v: any) => (
          <li key={v.id}>
            <div className="user">
              <Avatar noStatus small user={v.user} />
              {v.user.name}
            </div>
            <div>
              <Button type="secondary" onclick={() => true}>
                Make mod
              </Button>
              <Button type="danger" onclick={() => true}>
                Mute
              </Button>
              <Button type="danger" onclick={() => true}>
                Ban
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
