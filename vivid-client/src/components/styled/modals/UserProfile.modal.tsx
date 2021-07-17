import React from 'react';
import './UserProfileModal.css';
import { ModalBase } from './ModalBase';
import { Button } from '../Button';
import { useFetch } from '../../../hooks/useFetch';
import { UserContext } from '../../../hooks/useUser';

export function UserProfileModal(props: {
  user: any;
  open: boolean;
  close: () => void;
}) {
  const userData = React.useContext<any>(UserContext);

  return (
    <ModalBase
      isOpen={props.open}
      width={450}
      onBackPress={() => props.close()}
    >
      <div className="user-profile-card">
        <h2>{props.user.name}</h2>
        <BlockAction userData={userData} userId={props.user.id} />
        <FriendAction userData={userData} friendId={props.user.id} />
      </div>
    </ModalBase>
  );
}

function BlockAction(props: { userData: any; userId: string }) {
  const blockUser = useFetch({
    url: `/api/v1/blocks/${props.userId}`,
    method: 'POST',
  });

  const unBlockUser = useFetch({
    url: `/api/v1/blocks/${props.userId}`,
    method: 'DELETE',
  });

  React.useEffect(() => {
    if (blockUser.done) {
      blockUser.reset();
      props.userData?.updateUser({
        blocks: [...props.userData.user.blocks, props.userId],
      });
    }
    if (unBlockUser.done) {
      unBlockUser.reset();
      props.userData?.updateUser({
        blocks: props.userData.user.blocks.filter(
          (v: string) => v !== props.userId,
        ),
      });
    }
  }, [blockUser.done, unBlockUser.done, props.userData]);

  if (props.userData?.user?.id === props.userId) {
    return null;
  }

  let method = blockUser;
  let buttonText = 'Block User';
  let buttonType = 'danger';
  if (props.userData?.user?.blocks?.includes(props.userId)) {
    method = unBlockUser;
    buttonText = 'Unblock User';
    buttonType = 'secondary';
  }

  return (
    <Button
      loading={method.loading}
      type={buttonType === 'danger' ? 'danger' : 'secondary'}
      onclick={() => method.run()}
    >
      {buttonText}
    </Button>
  );
}

function FriendAction(props: { userData: any; friendId: string }) {
  const friendUser = useFetch({
    url: `/api/v1/friends/add/${props.friendId}`,
    method: 'POST',
  });

  const unFriend = useFetch({
    url: `/api/v1/friends/unfriend/${props.friendId}`,
    method: 'DELETE',
  });

  const acceptFriend = useFetch({
    url: `/api/v1/friends/accept/${props.friendId}`,
    method: 'PATCH',
  });

  React.useEffect(() => {
    if (friendUser.done) {
      const friendship = friendUser.data.data;
      friendUser.reset();

      props.userData?.updateUser({
        friends: [
          ...props.userData.user.friends,
          {
            id: friendship.id,
            userId: props.userData.user.id,
            friendId: props.friendId,
            requested_by: friendship.requested_by,
            requested_to: friendship.requested_to,
            accepted: friendship.accepted,
          },
        ],
      });
    }
    if (unFriend.done) {
      const friendship = unFriend.data.data;
      unFriend.reset();
      props.userData?.updateUser({
        friends: props.userData.user.friends.filter(
          (v: any) => v.id !== friendship.id,
        ),
      });
    }
    if (acceptFriend.done) {
      const friendship = acceptFriend.data.data;
      acceptFriend.reset();
      props.userData?.updateUser({
        friends: props.userData.user.friends.filter((v: any) => {
          if (v.id === friendship.id) v.accepted = true;
          return v;
        }),
      });
    }
  }, [friendUser.done, unFriend.done, props.userData, acceptFriend.done]);

  if (props.userData?.user?.id === props.friendId) {
    return null;
  }

  const friendship = props.userData?.user?.friends?.find(
    (v: any) => v.friendId === props.friendId,
  );

  let method: any;
  let buttonText;
  let buttonType;
  let twoButtons = false;

  if (!friendship) {
    method = friendUser;
    buttonText = 'Send Friend Request';
    buttonType = 'secondary';
  } else {
    if (friendship.accepted) {
      method = unFriend;
      buttonText = 'Unfriend User';
      buttonType = 'danger';
    } else {
      if (friendship.requested_by === props.friendId) {
        method = acceptFriend;
        buttonText = 'Accept Friend Request';
        buttonType = 'secondary';
        twoButtons = true;
      } else {
        method = unFriend;
        buttonText = 'Cancel Friend Request';
        buttonType = 'danger';
      }
    }
  }

  return (
    <>
      <Button
        loading={method.loading}
        type={buttonType === 'danger' ? 'danger' : 'secondary'}
        onclick={() => method.run()}
      >
        {buttonText}
      </Button>
      {twoButtons ? (
        <Button
          loading={unFriend.loading}
          type={'danger'}
          onclick={() => unFriend.run()}
        >
          Decline Friend Request
        </Button>
      ) : null}
    </>
  );
}

// avatar
// name
// online/offline
// channel role
// send friend request
// block
// dm
// ladder placement
