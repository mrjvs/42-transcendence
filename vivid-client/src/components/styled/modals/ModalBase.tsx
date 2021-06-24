import React from 'react';

export function ModalBase(props: {
  isOpen: boolean;
  children: any;
  hasDecorations?: boolean;
}) {
  props = {
    hasDecorations: false,
    ...props,
  };
  const [isVisible, setVisible] = React.useState('fadeout');

  function updateTransition() {
    if (props.isOpen === false && isVisible === 'fadeout') return;
    if (props.isOpen === false && isVisible === 'hidden') return;
    if (props.isOpen === true && isVisible === 'fadein') return;
    if (props.isOpen === true && isVisible === 'visible') return;

    if (props.isOpen === true) {
      setVisible('fadein');
    }
  }

  React.useEffect(() => {
    updateTransition();
  }, [props.isOpen]);

  return null;
}
