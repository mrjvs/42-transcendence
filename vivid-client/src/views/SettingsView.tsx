import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '../components/styled/Button';

export function SettingsView() {
  const history = useHistory();

  // TODO settings
  return (
    <div>
      <Button type="secondary" onclick={() => history.push('/')}>
        Back home
      </Button>

      <p>Settings screen goes here</p>
    </div>
  );
}
