import React from 'react';
import { Button } from '../Button';
import { Controls } from '../Controls';
import { ModalBase } from './ModalBase';

function ControlsModalCard(props: { open: boolean; close: () => void }) {
  return (
    <ModalBase
      isOpen={props.open}
      width={450}
      onBackPress={() => props.close()}
    >
      <div>
        <Controls />
      </div>
    </ModalBase>
  );
}

export function ControlsModal(props: { className?: string }) {
  const [openModal, setOpenModal] = React.useState(false);

  return (
    <div className={props.className || ''}>
      <Button type="secondary" less_padding onclick={() => setOpenModal(true)}>
        Check controls
      </Button>
      <ControlsModalCard open={openModal} close={() => setOpenModal(false)} />
    </div>
  );
}
