import React from 'react';
import './PunishmentModal.css';
import { TextInput } from '../TextInput';
import { ModalBase } from './ModalBase';
import { Button } from '../Button';

export function PunishmentModal(props: {
  open: boolean;
  onSubmit: (v: number) => void;
  mute?: boolean;
}) {
  const [number, setNumber] = React.useState<any>(null);

  return (
    <ModalBase isOpen={props.open} width={450}>
      <div className="punishment-modal-wrapper">
        <div className="text-input">
          <TextInput
            noPadding
            value={number}
            set={setNumber}
            placeholder="180"
            label={`How long is the ${props.mute ? 'mute' : 'ban'}`}
            type="number"
          />
        </div>
        <Button onclick={() => props.onSubmit(number)}>Continue</Button>
      </div>
    </ModalBase>
  );
}
