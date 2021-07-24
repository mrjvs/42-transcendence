import React from 'react';
import './AddonsModal.css';
import { ModalBase } from './ModalBase';
import { Button } from '../Button';
import { ToggleButton } from '../ToggleButton';
import { powerupMap, addons as addonList } from '../../../views/game/Powerup';

export function AddonsModal(props: {
  open: boolean;
  onSubmit: (v: any) => void;
  close: () => void;
}) {
  const [addons, setAddons] = React.useState<string[]>([]);

  function setter(str: string, on: boolean) {
    setAddons((prev) => {
      if (!on) return prev.filter((v) => v !== str);
      if (!prev.includes(str)) return [...prev, str];
      return prev;
    });
  }

  React.useEffect(() => {
    if (props.open) setAddons([...addonList]);
  }, [props.open]);

  return (
    <ModalBase isOpen={props.open} width={450} onBackPress={props.close}>
      <div className="addons-modal-wrapper">
        <h2>Select addons</h2>
        <div className="addon-modal-list">
          {addonList.map((v: any) => (
            <ToggleButton
              key={v}
              checked={addons.includes(v)}
              setter={(b) => setter(v, b)}
            >
              {powerupMap[v].display}
            </ToggleButton>
          ))}
        </div>
        <Button onclick={() => props.onSubmit(addons)}>
          Send duel request
        </Button>
      </div>
    </ModalBase>
  );
}
