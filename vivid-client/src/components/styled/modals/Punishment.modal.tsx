import React from 'react';
import './PunishmentModal.css';
import { TextInput } from '../TextInput';
import { ModalBase } from './ModalBase';
import { Button } from '../Button';
import { ToggleButton } from '../Toggle';

export function PunishmentModal(props: {
  open: boolean;
  onSubmit: (v: any) => void;
  close: () => void;
}) {
  const [number, setNumber] = React.useState<any>('');
  const [error, setError] = React.useState(false);
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    if (props.open) setNumber('');
  }, [props.open]);

  function numberValidation(number: string) {
    if (checked) {
      setError(false);
      props.onSubmit(null);
      return;
    }
    const num = parseInt(number);
    if (!num || num <= 0) {
      setError(true);
      return;
    }
    setError(false);
    props.onSubmit(num);
  }

  return (
    <ModalBase isOpen={props.open} width={450} onBackPress={props.close}>
      <div className="punishment-modal-wrapper">
        <h2>Punish member</h2>
        <ToggleButton checked={checked} setChecked={setChecked}>
          For life
        </ToggleButton>
        {!checked ? (
          <div className="text-input">
            <TextInput
              noPadding
              value={number}
              set={setNumber}
              placeholder="Seconds punished"
              label={'How long?'}
            />
          </div>
        ) : null}
        <Button onclick={() => numberValidation(number)}>Punish</Button>
        {error ? <p>Something went wrong, please try again later</p> : null}
      </div>
    </ModalBase>
  );
}
