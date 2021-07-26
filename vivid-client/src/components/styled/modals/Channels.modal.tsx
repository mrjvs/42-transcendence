import React from 'react';
import { useFetch } from '../../../hooks/useFetch';
import { TabsModal } from '../Tabs';
import { ModalBase } from './ModalBase';
import './ChannelsModal.css';
import { UserContext } from '../../../hooks/useUser';
import { ChannelsContext } from '../../../hooks/useChannels';
import { TextInput } from '../TextInput';
import { Button } from '../Button';
import { ToggleButton } from '../Toggle';

function ChannelBar(props: {
  title: string;
  hasPassword: boolean;
  join: (pass?: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [pass, setPass] = React.useState('');

  return (
    <div className="channel-list-item">
      <p
        className="channel-title"
        onClick={(e) => {
          e.preventDefault();
          if (props.hasPassword) {
            setOpen((prev) => !prev);
          } else {
            props.join();
          }
        }}
      >
        {props.title}
      </p>
      {open ? (
        <div className="channel-pass-form">
          <TextInput
            placeholder="Password here"
            label="Channel password"
            set={setPass}
            value={pass}
            className="channel-input"
            type="password"
          />
          <Button
            more_padding
            onclick={() => {
              props.join(pass);
              setOpen(false);
            }}
          >
            Join now
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function PublicChannelList() {
  const userData = React.useContext(UserContext);
  const channelsData = React.useContext(ChannelsContext);
  const channelList = useFetch({
    url: '/api/v1/channels?type=public',
    runOnLoad: true,
    method: 'GET',
  });
  const joinChannelFetch = useFetch({
    url: '',
    method: 'POST',
  });

  function joinChannel(id: string, pass?: string) {
    let body = undefined;
    if (pass) {
      body = {
        password: pass,
      };
    }
    joinChannelFetch.reset();
    joinChannelFetch.run(body, `/api/v1/channels/${id}/users/@me`);
  }

  React.useEffect(() => {
    if (joinChannelFetch.done) {
      const newChannel = joinChannelFetch.data?.data;
      channelsData.addChannel({
        ...newChannel.channel,
        joined_users: [newChannel],
      });
    }
  }, [joinChannelFetch.done]);

  const joinedChannels = channelsData.channels
    .filter((v: any) => {
      return !!v?.data?.joined_users?.find((u: any) => {
        return userData?.user?.id && u.user === userData.user.id && u.is_joined;
      });
    })
    .map((v: any) => v?.id);
  const filteredChannels = channelList.data?.data?.filter(
    (v: any) => !joinedChannels.includes(v.id),
  );

  return (
    <div>
      <h3>Public channels</h3>
      {joinChannelFetch.loading ? (
        <p className="channel-text">Joining channel...</p>
      ) : joinChannelFetch.error ? (
        joinChannelFetch.error?.res?.status == 403 ? (
          <p className="channel-error">Incorrect password</p>
        ) : (
          <p className="channel-error">
            Failed to join channel, try again later
          </p>
        )
      ) : null}
      {channelList.loading ? (
        <p className="channel-text">Loading channels...</p>
      ) : channelList.error ? (
        <p className="channel-error">Error loading channels, try again later</p>
      ) : (
        <div className="channel-list">
          {filteredChannels?.map((v: any) => (
            <ChannelBar
              key={v.id}
              title={v.title}
              hasPassword={v.has_password}
              join={(pass) => {
                joinChannel(v.id, pass);
              }}
            />
          ))}
          {filteredChannels && filteredChannels.length == 0 ? (
            <p className="channel-text">No channels to be displayed</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

// TODO password
function JoinPrivateChannel() {
  const channelsData = React.useContext(ChannelsContext);
  const [privateId, setPrivateId] = React.useState('');
  const [pass, setPass] = React.useState('');

  const joinChannelFetch = useFetch({
    url: '',
    method: 'POST',
  });

  function run() {
    let body = undefined;
    if (pass && pass.length > 0) {
      body = {
        password: pass,
      };
    }
    joinChannelFetch.reset();
    joinChannelFetch.run(body, `/api/v1/channels/${privateId}/users/@me`);
  }

  React.useEffect(() => {
    if (joinChannelFetch.done) {
      const newChannel = joinChannelFetch.data?.data;
      setPrivateId('');
      channelsData.addChannel({
        ...newChannel.channel,
        joined_users: [newChannel],
      });
    }
  }, [joinChannelFetch.done]);

  return (
    <div className="channel-private channel-form">
      <TextInput
        placeholder="Your private channel id"
        label="Channel ID"
        set={setPrivateId}
        value={privateId}
        className="channel-input"
      />
      <TextInput
        placeholder="Password here"
        label="Channel password (optional)"
        set={setPass}
        value={pass}
        className="channel-input"
        type="password"
      />
      <Button
        more_padding
        loading={joinChannelFetch.loading}
        onclick={() => run()}
      >
        Join now
      </Button>
      {joinChannelFetch.error ? (
        joinChannelFetch.error?.res?.status == 404 ? (
          <p className="channel-error">couldn&apos;t find that channel</p>
        ) : joinChannelFetch.error?.res?.status == 403 ? (
          <p className="channel-error">Incorrect password</p>
        ) : (
          <p className="channel-error">
            Failed to join channel, try again later
          </p>
        )
      ) : null}
      {joinChannelFetch.done ? (
        <p className="channel-text">Successfully joined channel</p>
      ) : null}
    </div>
  );
}

function CreateNewChannel() {
  const channelsData = React.useContext(ChannelsContext);
  const [channelName, setChannelName] = React.useState('');

  const [getToggle, setToggle] = React.useState(false);

  const createChannelFetch = useFetch({
    url: '/api/v1/channels',
    method: 'POST',
  });

  function run() {
    createChannelFetch.reset();
    createChannelFetch.run({
      title: channelName,
      hasPassword: false,
      isPublic: getToggle,
    });
  }

  React.useEffect(() => {
    if (createChannelFetch.done) {
      const newChannel = createChannelFetch.data?.data?.join;
      setChannelName('');
      channelsData.addChannel({
        ...newChannel.channel,
        joined_users: [newChannel],
      });
    }
  }, [createChannelFetch.done]);

  return (
    <div className="channel-private channel-form">
      <TextInput
        placeholder="Best channel ever!"
        label="Channel name"
        set={setChannelName}
        value={channelName}
        className="channel-input"
      />
      <ToggleButton checked={getToggle} setChecked={setToggle}>
        Make public channel
      </ToggleButton>
      <Button
        more_padding
        loading={createChannelFetch.loading}
        onclick={() => run()}
      >
        Create now
      </Button>
      {createChannelFetch.error ? (
        <p className="channel-error">
          Failed to create channel, try again later
        </p>
      ) : null}
      {createChannelFetch.done ? (
        <p className="channel-text">Successfully created channel</p>
      ) : null}
    </div>
  );
}

export function ChannelsModal(props: { open: boolean; close: () => void }) {
  const [modalTab, setModalTab] = React.useState('');

  React.useEffect(() => {
    if (props.open) setModalTab('public');
    else setModalTab('');
  }, [props.open]);

  return (
    <ModalBase
      isOpen={props.open}
      width={700}
      onBackPress={() => props.close()}
    >
      <h1>Add more channels</h1>
      <TabsModal
        set={setModalTab}
        value={modalTab}
        tabs={[
          {
            name: 'Public channels',
            value: 'public',
          },
          { name: 'Join private', value: 'private' },
          { name: 'Create new', value: 'new' },
        ]}
      />
      {modalTab === 'public' ? (
        <PublicChannelList />
      ) : modalTab === 'private' ? (
        <JoinPrivateChannel />
      ) : modalTab === 'new' ? (
        <CreateNewChannel />
      ) : null}
    </ModalBase>
  );
}
