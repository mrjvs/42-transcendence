import React from 'react';
import './AddonsModal.css';
import { TextInput } from '../TextInput';
import { ModalBase } from './ModalBase';
import { Button } from '../Button';
import { ToggleButton } from '../Toggle';

const supportedAddons = ['bigpad', 'bigball', 'fastball', 'fastpad', 'sticky'];

export function AddonsModal(props: {
  open: boolean;
  onSubmit: (v: any) => void;
  close: () => void;
}) {
  const [error, setError] = React.useState(false);
  const [addons, setAddons] = React.useState<string[]>([]);

  function setter(str: string, on: boolean) {
    setAddons((prev) => {
      if (!on) return prev.filter((v) => v !== str);
      if (!prev.includes(str)) return [...prev, str];
      return prev;
    });
  }

  React.useEffect(() => {
    if (props.open) setAddons([]);
  }, [props.open]);

  return (
    <ModalBase isOpen={props.open} width={450} onBackPress={props.close}>
      <div className="addons-modal-wrapper">
        <h2>Enable/Disable addons</h2>
        <ul>
          {supportedAddons.map((v: any) => (
            <li key={v}>
              <ToggleButton
                checked={addons.includes(v)}
                setChecked={(b) => setter(v, b)}
              >
                {v}
              </ToggleButton>
            </li>
          ))}
        </ul>
        <Button onclick={() => props.onSubmit(addons)}>Enable</Button>
        {error ? <p>Something went wrong, please try again later</p> : null}
      </div>
    </ModalBase>
  );
}
