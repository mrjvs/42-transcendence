import React from 'react';
import { ModalBase } from './ModalBase';
import { Icon } from '../Icon';
import { TextInput } from '../TextInput';
import './AccountSetupModal.css';
import { Button } from '../Button';
import { useFetch } from '../../../hooks/useFetch';
import { UserContext } from '../../../hooks/useUser';

export function AccountSetupModal(props: { open: boolean; close: () => void }) {
  const [username, setUsername] = React.useState('');
  const { run, done, error, loading, reset, data } = useFetch({
    runOnLoad: false,
    url: '/api/v1/users/@me/name',
    method: 'PATCH',
  });
  const userData = React.useContext(UserContext);

  React.useEffect(() => {
    if (props.open) {
      reset();
    }
  }, [props.open]);

  React.useEffect(() => {
    if (done) {
      userData.updateUser({
        name: data?.data?.name,
      });
      props.close();
    }
  }, [done]);

  return (
    <ModalBase isOpen={props.open} hasDecorations={true} width={400}>
      <div className="account-setup-modal">
        <div className="icon">
          <Icon type="radio" />
        </div>
        <h1 className="heading">Lets get you setup right away</h1>
        <p className="paragraph">
          One more step, What do you <br /> want to be called?
        </p>
        <div className="paddbot">
          <TextInput
            value={username}
            set={setUsername}
            placeholder="John Doe"
            label="Username"
          />
        </div>
        {error && error?.data?.code === 'inuse' ? (
          <p>That username is already in use</p>
        ) : error && error?.res?.status === 400 ? (
          <p>Username must be at least 1 character</p>
        ) : error ? (
          <p>Something went wrong, try again later</p>
        ) : null}
        <Button loading={loading} onclick={() => run({ username })}>
          Get started
        </Button>
      </div>
    </ModalBase>
  );
}
