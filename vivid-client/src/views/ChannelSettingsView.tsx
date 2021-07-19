import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button } from '../components/styled/Button';
import { Icon } from '../components/styled/Icon';
import './ChannelSettingsView.css';
import '../components/styled/Tags.css';
import { useFetch } from '../hooks/useFetch';
import { TextInput, UnusableTextInput } from '../components/styled/TextInput';
import { ToggleButton } from '../components/styled/Toggle';
import { Avatar } from '../components/styled/Avatar';
import { useMessages } from '../hooks/useMessages';
import { UsersContext } from '../hooks/useUsers';

export function ChannelSettingsView() {
  const history = useHistory();
  const { id }: any = useParams();
  const {
    channelInfo,
    messageState,
    getRole,
    updateChannelInfo,
    currentChannelUser,
  } = useMessages(id);
  const isOwner = currentChannelUser.user?.user === channelInfo.owner;
  const channelProps = {
    channel: channelInfo,
    updateChannelInfo,
    getRole,
    currentChannelUser,
    isOwner,
  };

  if (messageState.loading) return <p>Loading...</p>;

  if (messageState.error) return <p>Failed to load</p>;

  return (
    <div className="channel-settings-view">
      <Button type="secondary" onclick={() => history.push(`/channel/${id}`)}>
        <Icon type="left_arrow" />
        Back to channel
      </Button>
      {isOwner ? (
        <div>
          <h1>Channel settings</h1>
          <ChannelSettingsCard channelData={channelProps} />
        </div>
      ) : null}
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
      props.channelData.channel.title !== channelName
    ) {
      setChannelName(props.channelData.channel.title);
    }
    if (props.channelData?.channel?.is_public !== undefined) {
      setIsPublic(props.channelData?.channel?.is_public);
    }
    if (props.channelData?.channel?.has_password !== undefined) {
      setHasPassword(props.channelData?.channel?.has_password);
    }
  }, [props.channelData]);

  React.useEffect(() => {
    if (updateChannelFetch.done) {
      props.channelData?.updateChannelInfo(props.channelData.channel);
      updateChannelFetch.reset();
    }
  }, [updateChannelFetch.done]);

  return (
    <div className="channel-settings-wrapper card">
      <div className="channel-settings-expand">
        <h2>{channelName}</h2>
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
          <ToggleButton checked={isPublic} setChecked={setIsPublic}>
            Public channel
          </ToggleButton>
          <ToggleButton checked={hasPassword} setChecked={setHasPassword}>
            Password protected
          </ToggleButton>
        </div>
        {hasPassword ? (
          <div className="password">
            {active ? (
              <div className="text-wrapper">
                <TextInput
                  value={password}
                  set={setPassword}
                  placeholder="Password here..."
                  label="Password"
                  noPadding
                />
              </div>
            ) : (
              <>
                <UnusableTextInput label="password" text="Password is hidden" />
                <Button
                  loading={updateChannelFetch.loading}
                  type="secondary"
                  onclick={() => {
                    setPassword('');
                    setActive(true);
                  }}
                >
                  Change Password
                </Button>
              </>
            )}
          </div>
        ) : null}
        <Button
          less_padding
          loading={updateChannelFetch.loading}
          onclick={() => {
            const passObj: any = {};
            if (hasPassword && active) passObj.password = password;
            updateChannelFetch.run({
              title: channelName,
              isPublic: isPublic,
              hasPassword: hasPassword,
              ...passObj,
            });
            setActive(false);
          }}
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
        <h2>{channelName}</h2>
        <p style={{ color: '#9DA6C4' }}>
          {props.channelData.channel.joined_users.length}
          {props.channelData.channel.joined_users.length === 1
            ? ' member'
            : ' members'}
        </p>
        <div style={{ color: '#7BDB94' }}>
          <div className="info-line">
            <Icon type="checkmark" />
            {isPublic ? ' Public channel' : ' Private channel'}
          </div>
          <div className="info-line">
            <Icon type="checkmark" />
            {hasPassword ? ' Password protected' : ' Free to join'}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChannelModeratorCard(props: { channelData: any }) {
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
        {props.channelData?.channel.joined_users
          .filter((v: any) => v.is_mod)
          .map((v: any) => (
            <li key={v.user}>
              <UserTag
                user={v}
                channelOwner={props.channelData?.channel.owner}
              />
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
      {makeMod.error ? <p>Something went wrong, try again later</p> : null}
    </div>
  );
}

function ChannelPunishedMembersCard(props: { channelData: any }) {
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
        {props.channelData?.channel.joined_users
          .filter((v: any) => v.is_banned || v.is_muted)
          .map((v: any) => (
            <li key={v.user}>
              <UserTag
                user={v}
                channelOwner={props.channelData?.channel.owner}
              />
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
          ))}
      </ul>
      {updatePermissions.error ? (
        <p>Something went wrong, try again later</p>
      ) : null}
    </div>
  );
}

function ChannelMembersCard(props: { channelData: any }) {
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
        {props.channelData?.channel.joined_users
          .filter((v: any) => v.is_joined)
          .map((v: any) => (
            <li key={v.user}>
              <UserTag
                user={v}
                channelOwner={props.channelData?.channel.owner}
              />
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
                        { isMuted: true },
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
                        { isBanned: true },
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
      {updatePermissions.error || makeMod.error ? (
        <p>Something went wrong, try again later</p>
      ) : null}
    </div>
  );
}

function UserTag(props: { user: any; channelOwner: any }) {
  const { getUser } = React.useContext(UsersContext);
  const realUser = getUser(props.user.user);
  const tags = [];
  if (props.channelOwner === props.user.user) tags.push('owner');
  if (props.user.is_mod) tags.push('mod');
  if (props.user.is_muted) tags.push('muted');
  if (props.user.is_banned) tags.push('banned');

  return (
    <div className="user">
      <Avatar noStatus small user={realUser?.data} />
      <div className="user-flex-end">
        {realUser?.data.name}
        {tags.map((v) => (
          <span key={v} className={`user-tag tag-${v.toLowerCase()}`}>
            {v.toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
