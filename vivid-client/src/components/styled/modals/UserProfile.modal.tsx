import React from 'react';
import './UserProfileModal.css';
import { ModalBase } from './ModalBase';
import { Button } from '../Button';
import { useFetch } from '../../../hooks/useFetch';
import { UserContext } from '../../../hooks/useUser';
import { Avatar } from '../Avatar';
import { UsersContext } from '../../../hooks/useUsers';
import { MatchList } from '../MatchList';

function ModalContent(props: {
  userData: any;
  profileData: any;
  tab: string;
  setTab: (str: string) => void;
}) {
  const isBlocked = props.userData?.user?.blocks?.includes(
    props.profileData.user.id,
  );

  return (
    <div>
      <p>
        <span onClick={() => props.setTab('profile')}>profile</span>{' '}
        <span onClick={() => props.setTab('matchhistory')}>history</span>
      </p>
      <div
        className={`user-profile-grid ${
          props.tab !== 'profile' ? 'hidden' : ''
        }`}
      >
        <BlockAction
          userData={props.userData}
          userId={props.profileData.user.id}
        />
        {isBlocked ? (
          <div className="user-profile-section padded">
            <h2 className="user-profile-section-heading center">
              you&apos;ve blocked this user
            </h2>
          </div>
        ) : (
          <div className="user-profile-section padded">
            <h2 className="user-profile-section-heading">
              They sent you a friend request
            </h2>
            <Button less_padding type="primary">
              Accept friend
            </Button>
          </div>
        )}
      </div>
      <div
        className={`user-profile-matches ${
          props.tab !== 'matchhistory' ? 'hidden' : ''
        }`}
      >
        <MatchList
          currentUser={props.profileData.user.id}
          matchList={props.profileData.matches}
        />
      </div>
    </div>
  );
}

export function UserProfileModal(props: {
  user: any;
  open: boolean;
  close: () => void;
}) {
  const userData = React.useContext<any>(UserContext);
  const { getUser, addUser } = React.useContext<any>(UsersContext);
  const [tab, setTab] = React.useState('profile');
  const profileData = useFetch({
    method: 'GET',
    url: '',
  });

  React.useEffect(() => {
    if (props.open) {
      setTab('profile');
      profileData.run(undefined, `/api/v1/users/${props.user.id}/profile`);
    }
  }, [props.open]);

  React.useEffect(() => {
    if (profileData.done) {
      addUser(profileData.data.data.user);
    }
  }, [profileData.done]);

  return (
    <ModalBase
      isOpen={props.open}
      width={650}
      onBackPress={() => props.close()}
    >
      <div className="user-profile-card">
        <div className="user-profile-section margined">
          <div className="user-profile-avatar">
            <Avatar user={props.user} color="#222639" />
            <h2>{getUser(props.user.id)?.data?.name || 'Unknown user'}</h2>
          </div>
        </div>
        {profileData.loading ? (
          <p>Loading...</p>
        ) : profileData.error ? (
          <p>Failed to load profile</p>
        ) : profileData.done ? (
          <ModalContent
            profileData={profileData.data.data}
            setTab={setTab}
            tab={tab}
            userData={userData}
          />
        ) : null}
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
  let buttonText = 'Block';
  let buttonType: any = 'danger';
  let text = 'Are they annoying';
  if (props.userData?.user?.blocks?.includes(props.userId)) {
    method = unBlockUser;
    buttonText = 'Unblock';
    buttonType = 'secondary';
    text = "You've blocked this user";
  }

  return (
    <div className="user-profile-section padded">
      <h2 className="user-profile-section-heading">{text}</h2>
      <Button
        loading={method.loading}
        more_padding
        type={buttonType}
        onclick={() => method.run()}
      >
        {buttonText}
      </Button>
    </div>
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
