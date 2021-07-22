import React from 'react';
import '../sidebar/ActionRow.css';
import { SidebarLink } from '../sidebar/SidebarLink';
import { Avatar } from '../Avatar';
import { ModalBase } from './ModalBase';
import { Button } from '../Button';
import { TextInput } from '../TextInput';
import { useFetch } from '../../../hooks/useFetch';
import { FriendAction } from './UserProfile.modal';
import { SocketContext } from '../../../hooks/useWebsocket';

export function FindUsers(props: { userData: any }) {
  const [userName, setUserName] = React.useState('');
  const [foundUsers, setFoundUsers] = React.useState<any>(null);

  const findUser = useFetch({
    url: `/api/v1/users/find/${userName}`,
    method: 'GET',
  });

  React.useEffect(() => {
    if (findUser.error) setFoundUsers(null);
    if (findUser.done) setFoundUsers(findUser.data.data);
    findUser.reset();
  }, [findUser.done]);

  return (
    <div>
      <TextInput
        value={userName}
        set={setUserName}
        placeholder="John Doe"
        label="User Name"
      />
      <Button small={false} type="secondary" onclick={() => findUser.run()}>
        Search
      </Button>
      {foundUsers
        ? foundUsers.map((v: any) => {
            return (
              <div key={v.id}>
                <SidebarLink link="">
                  <Avatar isClickable user={v} small={true} />
                  <span>{v.name}</span>
                  <FriendAction userData={props.userData} friendId={v.id} />
                </SidebarLink>
              </div>
            );
          })
        : null}
    </div>
  );
}

function FriendRequests(props: { requests: any; userData: any }) {
  return props.requests.map((v: any) => {
    const potentialFriend =
      v.user_1.id === props.userData.user.id ? v.user_2 : v.user_1;
    return (
      <div key={potentialFriend.id}>
        <SidebarLink link="">
          <Avatar isClickable user={potentialFriend} small={true} />
          <span>{potentialFriend.name}</span>
          <FriendAction
            userData={props.userData}
            friendId={potentialFriend.id}
          />
        </SidebarLink>
      </div>
    );
  });
}

export function FriendsModal(props: {
  userData: any;
  open: boolean;
  close: () => void;
}) {
  const [state, setState] = React.useState('requests');
  const [friendRequests, setFriendRequests] = React.useState([]);
  const { client } = React.useContext(SocketContext);

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

  React.useEffect(() => {
    if (client) client.on('friendship_update', findFriendRequests.run);

    return () => {
      if (client) client.off('friendship_update', findFriendRequests.run);
    };
  }, [client]);

  return (
    <ModalBase
      isOpen={props.open}
      width={450}
      onBackPress={() => props.close()}
    >
      <Button
        badge={friendRequests.length}
        small={true}
        type="secondary"
        onclick={() => setState('requests')}
      >
        Friend Requests
      </Button>
      <Button small={true} type="secondary" onclick={() => setState('add')}>
        Add friends
      </Button>
      {state === 'requests' ? (
        <FriendRequests requests={friendRequests} userData={props.userData} />
      ) : (
        <FindUsers userData={props.userData} />
      )}
    </ModalBase>
  );
}
