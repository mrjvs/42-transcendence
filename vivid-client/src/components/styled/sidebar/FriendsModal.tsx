import React from 'react';
import './ActionRow.css';
import { SidebarLink } from '../../../components/styled/sidebar/SidebarLink';
import { Avatar } from '../../../components/styled/Avatar';
import { ModalBase } from '../modals/ModalBase';
import { Button } from '../../../components/styled/Button';
import { TextInput } from '../TextInput';
import { useFetch } from '../../../hooks/useFetch';
import { FriendAction } from '../modals/UserProfile.modal';

export function FriendsModal(props: {
  userData: any;
  open: boolean;
  close: () => void;
}) {
  const [state, setState] = React.useState('requests');
  const [userId, setUserId] = React.useState('');
  const [foundUsers, setFoundUsers] = React.useState<any>(null);
  const [friendRequests, setFriendRequests] = React.useState([]);

  const findUser = useFetch({
    url: `/api/v1/users/${userId}`,
    method: 'GET',
  });

  React.useEffect(() => {
    setFriendRequests(() => {
      return props.userData.user.friends?.filter(
        (v: any) => !v.accepted && v.requested_by !== props.userData.user.id,
      );
    });
  }, [props.userData]);

  React.useEffect(() => {
    findUser.run();
    if (findUser.error) setFoundUsers(null);
    if (findUser.done) setFoundUsers(findUser.data.data);
    findUser.reset();
  }, [userId]);

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
        friendRequests.map((v: any) => {
          return (
            <div key={v.id}>
              <SidebarLink link="">
                <Avatar isClickable user={v.friend} small={true} />
                <span>{v.friend.name}</span>
              </SidebarLink>
            </div>
          );
        })
      ) : (
        <div>
          <TextInput
            value={userId}
            set={setUserId}
            placeholder="4db6efb2-936a-4ea1-954f-3890ca70ddd"
            label="UserID"
          />
          {foundUsers ? (
            <div key={foundUsers.id}>
              <SidebarLink link="">
                <Avatar isClickable user={foundUsers} small={true} />
                <span>{foundUsers.name}</span>
                <FriendAction
                  userData={props.userData}
                  friendId={foundUsers.id}
                />
              </SidebarLink>
            </div>
          ) : null}
        </div>
      )}
    </ModalBase>
  );
}
