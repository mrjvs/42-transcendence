import React from 'react';
import './MessageBox.css';
import { Button } from '../styled/Button';
import { Icon } from '../styled/Icon';
import { AddonsModal } from '../styled/modals/AddonsModal';

export function MessageBox(props: {
  placeholder: string;
  disabled: boolean;
  onSend: (obj: { text: string; type: boolean; extraData?: any }) => void;
}) {
  const [content, setContent] = React.useState('');
  const [openModal, setOpenModal] = React.useState(false);

  function onChange(event: any) {
    setContent(event.target.value);
  }

  function onSubmit(duel: boolean, extraData: any, event?: any) {
    if (event) event.preventDefault();
    props.onSend({ text: content, type: duel, extraData });
    setContent('');
  }

  function update(enabledAddons: string[]) {
    onSubmit(
      true,
      {
        addons: enabledAddons,
      },
      undefined,
    );
  }

  return (
    <div className="messageRow">
      <AddonsModal
        open={openModal}
        close={() => setOpenModal(false)}
        onSubmit={(v: any) => update(v)}
      />
      <Button type="duel" loading={false} onclick={() => setOpenModal(true)}>
        <Icon type="gamepad" />
      </Button>
      <form
        className="messageBox"
        onSubmit={(e) => onSubmit(false, undefined, e)}
      >
        <input
          onChange={onChange}
          value={content}
          type="text"
          disabled={props.disabled}
          placeholder={props.placeholder}
        />
      </form>
    </div>
  );
}
