import React from 'react';
import './Controls.css';

export const Controls = React.memo(function Controls() {
  return (
    <div className="waiting-controls">
      <h3 className="waiting-header">Controls</h3>
      <div className="waiting-keys">
        <div className="waiting-key hide"></div>
        <div className="waiting-key">W</div>
        <div className="waiting-key hide"></div>
        <div className="waiting-key fade">A</div>
        <div className="waiting-key">S</div>
        <div className="waiting-key fade">D</div>
      </div>
      <div className="waiting-key wide">Space</div>
    </div>
  );
});
