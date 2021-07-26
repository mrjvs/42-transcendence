import React from 'react';
import './ModalBase.css';

export function ModalBase(props: {
  isOpen: boolean;
  children: any;
  hasDecorations?: boolean;
  width?: number;
  onBackPress?: () => void;
}) {
  props = {
    hasDecorations: false,
    width: 500,
    ...props,
  };
  const [isVisible, setVisible] = React.useState('hidden');
  const [timeout, setTime] = React.useState<any>(null);

  function updateTransition() {
    if (props.isOpen === false && isVisible === 'fadeout') return;
    if (props.isOpen === false && isVisible === 'hidden') return;
    if (props.isOpen === true && isVisible === 'fadein') return;
    if (props.isOpen === true && isVisible === 'visible') return;

    if (props.isOpen === true) {
      setVisible('fadein');
    } else {
      setVisible('fadeout');
    }
  }

  React.useEffect(() => {
    if (isVisible === 'fadein') {
      setTime((prev: any) => {
        if (prev) clearTimeout(prev);
        return setTimeout(() => {
          setVisible('visible');
        }, 200);
      });
    } else if (isVisible === 'fadeout') {
      setTime((prev: any) => {
        if (prev) clearTimeout(prev);
        return setTimeout(() => {
          setVisible('hidden');
        }, 200);
      });
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isVisible]);

  React.useEffect(() => {
    updateTransition();
  }, [props.isOpen]);

  return (
    <section
      className={`modal-wrapper modal-${isVisible} ${
        props.hasDecorations ? 'deco' : ''
      }`}
    >
      <div className="overlay"></div>
      <div className="modal-wrapper">
        <div className="modal">
          <div
            className="card"
            onClick={function (e) {
              if (e.target !== e.currentTarget) return;
              props.onBackPress && props.onBackPress();
            }}
          >
            <div className="content-wrapper">
              <div
                className="content"
                style={{
                  width: props.width,
                }}
              >
                <div className="deco-1"></div>
                <div className="deco-2"></div>
                <div className="deco-3"></div>
                <div className="deco-4"></div>
                <div className="actual-content">{props.children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
