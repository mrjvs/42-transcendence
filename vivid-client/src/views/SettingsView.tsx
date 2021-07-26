import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '../components/styled/Button';
import { Icon } from '../components/styled/Icon';
import { TextInput } from '../components/styled/TextInput';
import { Avatar } from '../components/styled/Avatar';
import { UserContext } from '../hooks/useUser';
import './SettingsView.css';
import { useFetch } from '../hooks/useFetch';
import { TwoFaSetupModal } from '../components/styled/modals/TwoFaSetup.modal';

export function SettingsView() {
  const history = useHistory();
  const userData = React.useContext<any>(UserContext);

  return (
    <div className="settings-view-wrapper">
      <Button type="secondary-small" onclick={() => history.push('/')}>
        <Icon type="left_arrow" />
        Back home
      </Button>
      <h1>User settings</h1>
      <UserProfileCard userData={userData} />
      <SecurityCard userData={userData} />
    </div>
  );
}

function UserProfileCard(props: { userData: any }) {
  const fileRef = React.useRef<any>(null);
  const [newestUsername, setNewestUsername] = React.useState('');
  const [username, setUsername] = React.useState('');
  React.useEffect(() => {
    if (
      props.userData?.user?.name &&
      props.userData.user.name !== newestUsername
    ) {
      setUsername(props.userData.user.name);
      setNewestUsername(props.userData.user.name);
    }
  }, [newestUsername, props.userData]);

  const updateUserFetch = useFetch({
    url: '/api/v1/users/@me/name',
    method: 'PATCH',
  });

  const deleteAvatar = useFetch({
    url: '/api/v1/users/@me/avatar',
    method: 'DELETE',
  });

  const uploadAvatar = useFetch({
    url: '/api/v1/users/@me/avatar',
    method: 'POST',
  });

  React.useEffect(() => {
    if (updateUserFetch.done) {
      props.userData?.updateUser(updateUserFetch.data.data);
      updateUserFetch.reset();
    }
    if (deleteAvatar.done) {
      props.userData?.updateUser({ avatar: null });
      deleteAvatar.reset();
    }
    if (uploadAvatar.done) {
      props.userData?.updateUser(uploadAvatar.data.data);
      uploadAvatar.reset();
    }
  }, [updateUserFetch.done, deleteAvatar.done, uploadAvatar.done]);

  function uploadAvatarImage() {
    if (
      !fileRef.current ||
      !fileRef.current.files ||
      fileRef.current.files.length === 0
    )
      return;
    const form = new FormData();
    form.append('photo', fileRef.current.files[0]);
    uploadAvatar.run(form);
    return;
  }

  return (
    <div className="card">
      <div className="user-profile-columns">
        <Avatar user={props.userData?.user} noStatus />
        <div className="user-profile-expand">
          <div>
            <h2>User profile</h2>
            <label style={{ display: 'inline-block' }}>
              <input
                type="file"
                style={{ display: 'none' }}
                accept="image/*"
                ref={fileRef}
                onChange={() => uploadAvatarImage()}
              />
              <Button
                loading={uploadAvatar.loading}
                less_padding
                margin_right
                no_button
                type="secondary"
              >
                Upload avatar
              </Button>
            </label>
            <Button
              loading={deleteAvatar.loading}
              less_padding
              margin_right
              type="danger"
              onclick={() => deleteAvatar.run()}
            >
              Remove avatar
            </Button>
            {deleteAvatar.error || uploadAvatar.error ? (
              <p>Something went wrong, try again later</p>
            ) : null}
          </div>
          <div className="user-name">
            <div className="text-wrapper">
              <TextInput
                value={username}
                set={setUsername}
                placeholder="John Doe"
                label="Username"
                noPadding
              />
            </div>
            {updateUserFetch.error &&
            updateUserFetch.error?.data?.code === 'inuse' ? (
              <p>That username is already in use</p>
            ) : updateUserFetch.error &&
              updateUserFetch.error?.res?.status === 400 ? (
              <p>Username must be at least 1 character</p>
            ) : updateUserFetch.error ? (
              <p>Something went wrong, try again later</p>
            ) : null}
            <Button
              less_padding
              loading={updateUserFetch.loading}
              onclick={() => updateUserFetch.run({ username })}
            >
              Save username
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TwoFaInfo(props: { userData: any; twoFactor: boolean }) {
  const twoFaEnable = useFetch({
    url: '/api/v1/users/@me/2fa',
    method: 'PATCH',
  });

  const twoFaDisable = useFetch({
    url: '/api/v1/users/@me/2fa',
    method: 'DELETE',
  });

  const [openModal, setOpenModal] = React.useState(false);

  React.useEffect(() => {
    if (twoFaEnable.done) {
      setOpenModal(true);
      props.userData?.updateUser({ twoFactorEnabled: true, twofactor: true });
    }
    if (twoFaDisable.done) {
      twoFaDisable.reset();
      props.userData?.updateUser({ twoFactorEnabled: false, twofactor: null });
    }
  }, [twoFaEnable.done, twoFaDisable.done]);

  function closeModal() {
    setOpenModal(false);
    twoFaEnable.reset();
  }

  if (!props.twoFactor) {
    return (
      <div>
        <div className="red">
          <h2>Two Factor Authentication</h2>
          <p>
            <Icon className="twofa-icon" type="alert" />
            Two factor authentication is not enabled!
          </p>
          <Button
            loading={twoFaEnable.loading}
            less_padding
            margin_right
            onclick={() => {
              twoFaEnable.run();
            }}
          >
            Enable 2FA
          </Button>
        </div>
        {twoFaEnable.error ? (
          <p>Something went wrong, try again later</p>
        ) : null}
        <TwoFaSetupModal
          secret={twoFaEnable.data?.data?.secret}
          codes={twoFaEnable.data?.data?.backupCodes}
          open={openModal}
          close={() => closeModal()}
        />
      </div>
    );
  }
  return (
    <div>
      <div className="green">
        <h2>Two Factor Authentication</h2>
        <p>
          <Icon className="twofa-icon" type="checkmark" />
          Two factor authentication is enabled!
        </p>
        <Button
          loading={twoFaDisable.loading}
          less_padding
          margin_right
          type="danger"
          onclick={() => twoFaDisable.run()}
        >
          Disable 2FA
        </Button>
      </div>
      {twoFaDisable.error ? <p>Something went wrong, try again later</p> : null}
      <TwoFaSetupModal
        secret={twoFaEnable.data?.data?.secret}
        codes={twoFaEnable.data?.data?.backupCodes}
        open={openModal}
        close={() => closeModal()}
      />
    </div>
  );
}

function SecurityCard(props: { userData: any }) {
  const deleteUser = useFetch({
    url: '/api/v1/users/@me/',
    method: 'DELETE',
  });

  const logoutAll = useFetch({
    url: '/api/v1/users/@me/sessions',
    method: 'DELETE',
  });

  React.useEffect(() => {
    if (deleteUser.done) window.location.href = '/';
  }, [deleteUser.done]);

  return (
    <div className="card">
      <div className="twofa-wrapper">
        <TwoFaInfo
          userData={props.userData}
          twoFactor={props.userData?.user?.twoFactorEnabled}
        />
      </div>
      <div className="dangerZone-wrapper">
        <h2>Danger Zone</h2>
        <p>
          Watch out, these actions can permanently affect your account. Use with
          caution!
        </p>
        <Button
          less_padding
          margin_right
          type="danger"
          loading={deleteUser.loading}
          onclick={() => deleteUser.run()}
        >
          Delete account
        </Button>
        <Button
          less_padding
          margin_right
          type="secondary"
          loading={logoutAll.loading}
          onclick={() => logoutAll.run()}
        >
          Logout all devices
        </Button>
        {logoutAll.error ? <p>Something went wrong, try again later</p> : null}
        {logoutAll.done ? <p>Logged out all devices!</p> : null}
        {deleteUser.error ? (
          deleteUser.error.data?.statusCode === 400 ? (
            <p>
              Please transfer ownership of all your channels before you delete
              your account
            </p>
          ) : (
            <p>Something went wrong, try again later</p>
          )
        ) : null}
      </div>
    </div>
  );
}
