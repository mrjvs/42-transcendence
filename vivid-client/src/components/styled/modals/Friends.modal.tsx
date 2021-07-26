import React from 'react';
import { Avatar } from '../Avatar';
import { ModalBase } from './ModalBase';
import { Button } from '../Button';
import { TextInput } from '../TextInput';
import { useFetch } from '../../../hooks/useFetch';
import { FriendButton } from './UserProfile.modal';
import { TabsModal } from '../Tabs';

import './FriendModal.css';

export function SendRequest() {
  const [userName, setUserName] = React.useState('');

  const findUser = useFetch({
    url: '',
    method: 'POST',
  });

  function run() {
    findUser.reset();
    findUser.run(undefined, `/api/v1/friends/add-username/${userName}`);
  }

  React.useEffect(() => {
    if (findUser.done) {
      setUserName('');
    }
  }, [findUser.done]);

  return (
    <div>
      <div className="send-friend-request-wrap">
        <div className="text-input">
          <TextInput
            value={userName}
            set={setUserName}
            placeholder="John Doe"
            label="Friends username"
          />
        </div>
        <div className="button-wrap">
          <Button
            type="primary"
            loading={findUser.loading}
            onclick={() => run()}
          >
            Send request
          </Button>
          {findUser.error ? (
            findUser.error?.res?.status == 404 ? (
              <p className="text-error">that user doesn&apos;t exist!</p>
            ) : (
              <p className="text-error">Failed to send friend request</p>
            )
          ) : null}
          {findUser.done ? (
            <p className="text-success">Successfully sent friend request</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FriendRequests(props: { requests: any; userData: any }) {
  const friendRequests = props.requests.map((v: any) => ({
    id: v.id,
    theFriend: v.user_1.id === props.userData.user.id ? v.user_2 : v.user_1,
  }));

  return (
    <div className="friendlist-wrap">
      {friendRequests.map((v: any) => (
        <div className="friendlist-profile" key={v.id}>
          <div className="friendlist-avatar">
            <Avatar user={v.theFriend} small noStatus />
          </div>
          <span className="friendlist-name">{v.theFriend.name}</span>
          <FriendButton userData={props.userData} friendId={v.theFriend.id} />
        </div>
      ))}
      {friendRequests.length == 0 ? (
        <p className="friendlist-empty">
          You don&apos;t have any friend requests :(
        </p>
      ) : null}
    </div>
  );
}

export function FriendsModal(props: {
  userData: any;
  open: boolean;
  close: () => void;
}) {
  const [modalTab, setModalTab] = React.useState('requests');
  const [friendRequests, setFriendRequests] = React.useState([]);

  const findFriendRequests = useFetch({
    url: `/api/v1/friends/requests`,
    method: 'GET',
    runOnLoad: true,
  });

  React.useEffect(() => {
    if (findFriendRequests.done) {
      props.userData.updateUser({
        friends: [
          ...findFriendRequests.data.data.map((v: any) => {
            const friend =
              v.user_1.id === props.userData.user.id ? v.user_2 : v.user_1;
            return {
              id: v.id,
              userId: props.userData.user.id,
              user_1: v.user_1,
              user_2: v.user_2,
              friend,
              requested_by: v.requested_by,
              requested_to: v.requested_to,
              accepted: v.accepted,
            };
          }),
        ],
      });
      findFriendRequests.reset();
    }
  }, [findFriendRequests.done]);

  React.useEffect(() => {
    setFriendRequests(() => {
      return props.userData.user.friends?.filter(
        (v: any) => !v.accepted && v.requested_by !== props.userData.user.id,
      );
    });
  }, [props.userData]);

  return (
    <ModalBase
      isOpen={props.open}
      width={450}
      onBackPress={() => props.close()}
    >
      <TabsModal
        set={setModalTab}
        value={modalTab}
        tabs={[
          {
            name: 'Friend requests',
            value: 'requests',
          },
          { name: 'Add friend', value: 'add' },
        ]}
      />
      {modalTab === 'requests' ? (
        <FriendRequests requests={friendRequests} userData={props.userData} />
      ) : (
        <SendRequest />
      )}
    </ModalBase>
  );
}
