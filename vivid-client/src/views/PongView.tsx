import React, { useEffect, useState } from 'react';
import './ChannelView.css';
import { Canvas } from '../components/Canvas';
import { useParams } from 'react-router-dom';

export function PongView() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const { id }: any = useParams();

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Canvas
        width={windowWidth * 0.75}
        height={windowHeight * 0.75}
        gameId={id}
      />
    </>
  );
}
