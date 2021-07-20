import React from 'react';
import './PunishmentModal.css';
import { TextInput } from '../TextInput';
import { ModalBase } from './ModalBase';
import { Button } from '../Button';

export function PunishmentModal(props: {
  open: boolean;
  onSubmit: (v: number) => void;
  close: () => void;
}) {
  const [number, setNumber] = React.useState<any>('');
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (props.open) setNumber('');
  }, [props.open]);

  function numberValidation(number: string) {
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
        <div className="text-input">
          <TextInput
            noPadding
            value={number}
            set={setNumber}
            placeholder="Seconds punished"
            label={'How long is the punishment?'}
          />
        </div>
        <Button onclick={() => numberValidation(number)}>Punish</Button>
        {error ? <p>Please input a valid number above 0</p> : null}
      </div>
    </ModalBase>
  );
}
