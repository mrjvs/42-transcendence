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
import { UsersContext } from '../hooks/useUsers';

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

  const [active, setActive] = React.useState(false);

  const [hasPassword, setHasPassword] = React.useState(false);
  const [isPublic, setIsPublic] = React.useState(false);

  const updateChannelFetch = useFetch({
    url: `/api/v1/channels/${props.channelData.channel.id}`,
    method: 'PATCH',
  });

  React.useEffect(() => {
    if (
      props.channelData?.channel?.title &&
      props.channelData.channel.title !== newestChannelName
    ) {
      setChannelName(props.channelData.channel.title);
      setNewestChannelName(props.channelData.channel.title);
    }
  }, [newestChannelName, props.channelData]);

  React.useEffect(() => {
    if (updateChannelFetch.done) {
      props.channelData?.addChannel({ password: password });
      updateChannelFetch.reset();
    }
  }, [updateChannelFetch.done]);

  return (
    <div className="channel-settings-wrapper card">
      <div className="channel-settings-expand">
        <h2>{props.channelData.channel.title}</h2>
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
          {/* TODO set setPublic based on switch state*/}
          <ToggleButton>Password protected</ToggleButton>
          {/* TODO set setHasPassword based on switch state*/}
        </div>
        {!props.channelData.channel.has_password ? (
          <div className="password">
            <div className="text-wrapper" onClick={() => setActive(true)}>
              <TextInput
                value={password}
                set={setPassword}
                placeholder="Password is hidden"
                label="Password"
                noPadding
              />
            </div>
            {active ? (
              <Button
                loading={updateChannelFetch.loading}
                type="secondary"
                onclick={() => {
                  // TODO make a backend service just for password change
                  updateChannelFetch.run({
                    hasPassword: true,
                    password: password,
                  });
                  setActive(false); // TODO set to false also when clicked outside the input
                }}
              >
                Change Password
              </Button>
            ) : null}
          </div>
        ) : null}
        <Button
          less_padding
          loading={updateChannelFetch.loading}
          onclick={() =>
            updateChannelFetch.run({
              title: channelName,
              isPublic: isPublic,
              hasPassword: hasPassword,
              password: password,
            })
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
        <h2>{props.channelData.channel.title}</h2>
        <p style={{ color: '#9DA6C4' }}>
          {props.channelData.channel.joined_users.length}
          {props.channelData.channel.joined_users.length === 1
            ? ' member'
            : ' members'}
        </p>
        <div style={{ color: '#7BDB94' }}>
          <div className="info-line">
            <Icon type="checkmark" />
            {props.channelData.channel.is_public
              ? ' Public channel'
              : ' Private channel'}
          </div>
          <div className="info-line">
            <Icon type="checkmark" />
            {props.channelData.channel.has_password
              ? ' Password protected'
              : ' Free to join'}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChannelModeratorCard(props: { channelData: any }) {
  const { getUser } = React.useContext(UsersContext);
  const makeMod = useFetch({
    url: '',
    method: 'PATCH',
  });

  React.useEffect(() => {
    if (makeMod.done) makeMod.reset();
  }, [makeMod.done]);

  return (
    <div className="card">
      <ul>
        {props.channelData?.channel.joined_users.map((v: any) => (
          <li key={v.user}>
            <div className="user">
              <Avatar noStatus small user={getUser(v.user)?.data} />
              <span>
                {getUser(v.user)?.data.name}
                {v.is_mod ? <span className="tag">mod</span> : null}
              </span>
            </div>
            <div className="hideUnselected">
              <Button
                more_padding
                type="danger"
                onclick={() =>
                  makeMod.run(
                    { isMod: false },
                    `/api/v1/channels/${props.channelData.channel.id}/users/${v.user}/permissions`,
                  )
                }
              >
                Remove moderator
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChannelPunishedMembersCard(props: { channelData: any }) {
  const { getUser } = React.useContext(UsersContext);
  const updatePermissions = useFetch({
    url: '',
    method: 'PATCH',
  });

  React.useEffect(() => {
    if (updatePermissions.done) updatePermissions.reset();
  }, [updatePermissions.done]);

  return (
    <div className="card">
      <ul>
        {props.channelData?.channel.joined_users.map((v: any) =>
          v.is_banned || v.is_muted ? (
            <li key={v.user}>
              <div className="user">
                <Avatar noStatus small user={getUser(v.user)?.data} />
                {getUser(v.user)?.data.name}
              </div>
              <div className="hideUnselected">
                {v.is_banned ? (
                  <Button
                    more_padding
                    type="secondary"
                    margin_right
                    onclick={() =>
                      updatePermissions.run(
                        { isBanned: false, banExpiry: null },
                        `/api/v1/channels/${props.channelData.channel.id}/users/${v.user}`,
                      )
                    }
                  >
                    Unban
                  </Button>
                ) : null}
                {v.is_muted ? (
                  <Button
                    more_padding
                    type="danger"
                    onclick={() =>
                      updatePermissions.run(
                        { isMuted: false, muteExpiry: null },
                        `/api/v1/channels/${props.channelData.channel.id}/users/${v.user}`,
                      )
                    }
                  >
                    Unmute
                  </Button>
                ) : null}
              </div>
            </li>
          ) : null,
        )}
      </ul>
    </div>
  );
}

function ChannelMembersCard(props: { channelData: any }) {
  const { getUser } = React.useContext(UsersContext);
  const makeMod = useFetch({
    url: '',
    method: 'PATCH',
  });

  const updatePermissions = useFetch({
    url: '',
    method: 'PATCH',
  });

  React.useEffect(() => {
    if (makeMod.done) makeMod.reset();
    if (updatePermissions.done) updatePermissions.reset();
  }, [makeMod.done, updatePermissions.done]);

  return (
    <div className="card">
      <ul>
        {props.channelData?.channel.joined_users.map((v: any) => (
          <li key={v.user}>
            <div className="user">
              <Avatar noStatus small user={getUser(v.user)?.data} />
              {getUser(v.user)?.data.name}
            </div>
            <div className="hideUnselected">
              {!v.is_mod ? (
                <Button
                  type="secondary"
                  margin_right
                  more_padding
                  onclick={() =>
                    makeMod.run(
                      { isMod: true },
                      `/api/v1/channels/${props.channelData.channel.id}/users/${v.user}/permissions`,
                    )
                  }
                >
                  Make mod
                </Button>
              ) : null}
              {!v.is_muted ? (
                <Button
                  type="danger"
                  margin_right
                  more_padding
                  onclick={() =>
                    updatePermissions.run(
                      { isMuted: true /* TODO add mute expiry prompt*/ },
                      `/api/v1/channels/${props.channelData.channel.id}/users/${v.user}`,
                    )
                  }
                >
                  Mute
                </Button>
              ) : null}
              {!v.is_banned ? (
                <Button
                  more_padding
                  type="danger"
                  onclick={() =>
                    updatePermissions.run(
                      { isBanned: true /* TODO add ban expiry prompt*/ },
                      `/api/v1/channels/${props.channelData.channel.id}/users/${v.user}`,
                    )
                  }
                >
                  Ban
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
