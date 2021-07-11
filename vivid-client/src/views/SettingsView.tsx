import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '../components/styled/Button';
import { Icon } from '../components/styled/Icon';
import { TextInput } from '../components/styled/TextInput';
import { Avatar } from '../components/styled/Avatar';
import { UserContext } from '../hooks/useUser';

export function SettingsView() {
  const history = useHistory();

  const [newestUsername, setNewestUsername] = React.useState('');
  const [username, setUsername] = React.useState('');
  const userData = React.useContext<any>(UserContext);

  React.useEffect(() => {
    if (userData?.user?.name && userData.user.name !== newestUsername) {
      setUsername(userData.user.name);
      setNewestUsername(userData.user.name);
    }
  }, [newestUsername, userData]);

  return (
    <div className="settings-view-wrapper">
      <Button type="secondary" onclick={() => history.push('/')}>
        <Icon type="arrow" />
        Back home
      </Button>

      <div className="user-settings-wrapper">
        <h1>User settings</h1>
        <div className="user-profile-wrapper">
          <Avatar user={userData?.user} />
          <div className="user-avatar">
            <h2>User profile</h2>
            <Button onclick={() => alert('yey')}>Upload avatar</Button>
            <Button onclick={() => alert('ney')}>Remove avatar</Button>
          </div>
          <div className="user-name">
            <h3>Username</h3>
            <div className="paddbot">
              <TextInput
                value={username}
                set={setUsername}
                placeholder="John Doe"
                label="Username"
              />
            </div>
            <Button onclick={() => alert('saved')}>Save username</Button>
          </div>
        </div>
        <div className="security-settings-wrapper">
          <div className="2fa-wrapper">
            <h2>Two Factor Authentication</h2>
            <Icon type="red-exclamation" />
            Two factor authentication not enabled
            <Button onclick={() => alert('enabled')}>Enable 2fa</Button>
          </div>
          <div className="dangerZone-wrapper">
            <h2>Danger Zone</h2>
            <p>
              Watch out, these actions can permanently affect your account. Use
              with caution
            </p>
            <Button onclick={() => alert('bye')}>Delete account</Button>
            <Button onclick={() => alert('bye')}>Logout all devices</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
