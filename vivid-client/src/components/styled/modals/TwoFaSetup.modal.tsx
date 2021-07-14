import React from 'react';
import './TwoFaSetupModal.css';
import { Icon } from '../Icon';
import { Button } from '../Button';
import { ModalBase } from './ModalBase';
import QRCode from 'qrcode';

export function TwoFaSetupModal(props: {
  secret?: string;
  codes?: string[];
  open: boolean;
  close: () => void;
}) {
  const canvasRef = React.useRef<any>(null);
  React.useEffect(() => {
    if (canvasRef?.current) {
      QRCode.toCanvas(
        canvasRef.current,
        `otpauth://totp/Vivid?secret=${props.secret}`,
        { color: { light: '#6790E6', dark: '#252A40' }, width: 500 },
        () => false,
      );
    }
  }, [canvasRef, props.secret]);

  return (
    <ModalBase isOpen={props.open} width={450}>
      <div className="twofa-setup-modal">
        <div className="qr-icon">
          <canvas ref={canvasRef}></canvas>
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
            <ul>
              {props.codes?.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>
        </div>
        <Button onclick={() => props.close()}>Continue</Button>
      </div>
    </ModalBase>
  );
}
