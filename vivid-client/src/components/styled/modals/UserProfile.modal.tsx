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
        blocks: [...props.userData.data.blocks, props.userId],
      });
    }
    if (unBlockUser.done) {
      unBlockUser.reset();
      props.userData?.updateUser({
        blocks: props.userData.blocks.filter((v: string) => v !== props.userId),
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

// avatar
// name
// online/offline
// channel role
// send friend request
// block
// dm
// ladder placement
