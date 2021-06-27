import React from 'react';
import { ModalBase } from './ModalBase';

export function AccountSetupModal(props: { open: boolean }) {
  return (
    <ModalBase isOpen={props.open} hasDecorations={true}>
      <h1>Hello world</h1>
    </ModalBase>
  );
}
