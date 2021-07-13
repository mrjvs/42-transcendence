import React from 'react';
import './TwoFaSetupModal.css';
import { Icon } from '../Icon';
import { Button } from '../Button';
import { ModalBase } from './ModalBase';

export function TwoFaSetupModal(props: { open: boolean; close: () => void }) {
  return (
    <ModalBase isOpen={props.open} hasDecorations={false} width={400}>
      <div className="twofa-setup-modal">
        <div className="qr-icon">
          <Icon type="qrcode" />
        </div>
        <div className="icon">
          <Icon type="lock" />
        </div>
        <h2>Let&apos;s up the security</h2>
        <p className="twofa-motto">
          Because you can never have enough security!
        </p>
        <div className="backup-codes-card">
          <h5>Backup codes</h5>
          <div className="backup-codes">
            <p>...</p>
          </div>
        </div>
        <Button onclick={() => false}>Continue</Button>
      </div>
    </ModalBase>
  );
}
