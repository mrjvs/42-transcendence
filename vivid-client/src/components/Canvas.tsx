import React from 'react';
import { drawGame } from '../views/game/Draw';
import { IGameState } from '../views/game/Constants';
import { SocketContext } from '../hooks/useWebsocket';
import { Button } from './styled/Button';
import { useHistory } from 'react-router-dom';
import useSound from 'use-sound';
// @ts-ignore
import beepSfx from '../assets/sounds/beep.mp3';
// @ts-ignore
import boopSfx from '../assets/sounds/boop.mp3';

interface CanvasProps {
  gameId: string;
  loading: boolean;
  gameState: IGameState | null;
  mirrored: boolean;
}

const keyMap = {
  w: {
    press: false,
    key: 'up',
  },
  s: {
    press: false,
    key: 'down',
  },
  ' ': {
    press: true,
    key: 'action',
  },
};

export function PongGameCanvas({
  gameId,
  loading,
  gameState,
  mirrored,
}: CanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { client } = React.useContext(SocketContext);
  const gameStateReal = React.useRef<IGameState | null>(null);
  const countdownNum = React.useRef<number | string>(-1);
  const mirrorRef = React.useRef(false);
  const [showing, setShowing] = React.useState(false);
  const history = useHistory();

  // sounds
  const [playBeep] = useSound(beepSfx, {
    volume: 0.2,
  });
  const [playBoop] = useSound(boopSfx, {
    volume: 0.2,
  });

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D | null;

  React.useEffect(() => {
    gameStateReal.current = gameState;
    if (
      gameStateReal.current?.countdownNum &&
      gameStateReal.current?.countdownNum !== countdownNum.current
    ) {
      if (gameStateReal.current.countdownNum === 4) {
        countdownNum.current = 'Get ready';
      } else if (
        gameStateReal.current.countdownNum >= 0 &&
        gameStateReal.current.countdownNum <= 3
      ) {
        countdownNum.current = gameStateReal.current.countdownNum;
      }
    }
  }, [gameState]);

  React.useEffect(() => {
    let timeout: any = null;
    if (
      countdownNum.current >= 0 ||
      countdownNum.current.constructor === String
    ) {
      setShowing(true);
      // play sound
      if (countdownNum.current == 1) setTimeout(() => playBoop(), 100);
      else if (countdownNum.current == 2 || countdownNum.current == 3)
        setTimeout(() => playBeep(), 100);

      timeout = setTimeout(() => {
        setShowing(false);
        timeout = null;
      }, 700);
    }
    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [countdownNum.current]);

  React.useEffect(() => {
    mirrorRef.current = mirrored;
  }, [mirrored]);

  // grab context on render
  React.useEffect(() => {
    if (!canvasRef.current) return;

    canvas = canvasRef.current;
    context = canvas.getContext('2d');
  }, [canvasRef]);

  function keydown(event: KeyboardEvent) {
    if (event.repeat) return;
    const keyData = (keyMap as any)[event.key];
    if (!keyData) return;
    const eventName = keyData.press ? 'keypress' : 'keydown';
    client?.emit(eventName, {
      gameId,
      key: keyData.key,
    });
  }

  function keyup(event: KeyboardEvent) {
    if (event.repeat) return;
    const keyData = (keyMap as any)[event.key];
    if (!keyData) return;
    if (keyData.press) return;
    client?.emit('keyup', {
      gameId,
      key: keyData.key,
    });
  }

  // do render
  function render(ctx: any) {
    requestAnimationFrame(() => {
      if (ctx.stop) {
        return;
      }
      drawGame(gameStateReal.current, canvas, context, mirrorRef.current);
      render(ctx);
    });
  }

  // render loop
  React.useEffect(() => {
    const cancelKey = {
      stop: false,
    };
    render(cancelKey);
    return () => {
      cancelKey.stop = true;
    };
  }, []);

  // client loading
  React.useEffect(() => {
    // on load
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);

    return () => {
      // on unload
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('keyup', keyup);
    };
  }, []);

  return (
    <div className={`pong-canvas-wrapper ${loading ? 'loading' : ''}`}>
      <div className={`pong-countdown-overlay ${showing ? 'showing' : ''}`}>
        <p className="pong-countdown-text">{countdownNum.current}</p>
      </div>
      <div
        className={`pong-countdown-overlay invisible ${
          loading ? 'showing' : ''
        }`}
      >
        <div className="pong-waiting">
          <div className="waiting-right">
            <div className="loading-icon-rotate small" />
            <h2>Waiting for opponent</h2>
            <p>Lovely day isn&apos;t it?</p>
            <Button
              type="danger"
              more_padding
              onclick={() => history.push('/')}
            >
              cancel
            </Button>
          </div>
        </div>
      </div>
      {React.useMemo(
        () => (
          <canvas
            ref={canvasRef}
            height={1080}
            width={1920}
            className="pong-canvas"
          />
        ),
        [],
      )}
    </div>
  );
}
