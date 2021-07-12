import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '../components/styled/Button';
import { Icon } from '../components/styled/Icon';
import { TextInput } from '../components/styled/TextInput';
import { Avatar } from '../components/styled/Avatar';
import { UserContext } from '../hooks/useUser';
import './SettingsView.css';

export function SettingsView() {
  const history = useHistory();
  const userData = React.useContext<any>(UserContext);

  return (
    <div className="settings-view-wrapper">
      <Button type="secondary" onclick={() => history.push('/')}>
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

  return (
    <div className="card">
      <div className="user-profile-columns">
        <Avatar user={props.userData?.user} noStatus />
        <div className="user-profile-expand">
          <div>
            <h2>User profile</h2>
            <Button
              less_padding
              margin_right
              type="secondary"
              onclick={() => alert('yey')}
            >
              Upload avatar
            </Button>
            <Button
              less_padding
              margin_right
              type="danger"
              onclick={() => alert('ney')}
            >
              Remove avatar
            </Button>
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
            <Button less_padding onclick={() => alert('saved')}>
              Save username
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TwoFaInfo(props: { twoFactor: boolean }) {
  if (!props.twoFactor) {
    return (
      <div className="red">
        <h2>Two Factor Authentication</h2>
        <p>
          <Icon className="twofa-icon" type="alert" />
          Two factor authentication is not enabled!
        </p>
        <Button less_padding margin_right onclick={() => alert('enabled')}>
          Enable 2fa
        </Button>
      </div>
    );
  }
  return (
    <div className="green">
      <h2>Two Factor Authentication</h2>
      <p>
        <Icon className="twofa-icon" type="checkmark" />
        Two factor authentication is enabled!
      </p>
      <Button
        less_padding
        margin_right
        type="danger"
        onclick={() => alert('disabled')}
      >
        Disable 2fa
      </Button>
    </div>
  );
}

function SecurityCard(props: { userData: any }) {
  return (
    <div className="card">
      <div className="twofa-wrapper">
        <TwoFaInfo twoFactor={props.userData?.user?.twofactor} />
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
          onclick={() => alert('bye')}
        >
          Delete account
        </Button>
        <Button
          less_padding
          margin_right
          type="secondary"
          onclick={() => alert('bye')}
        >
          Logout all devices
        </Button>
      </div>
    </div>
  );
}
