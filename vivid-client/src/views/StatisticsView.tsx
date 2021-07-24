import React from 'react';
import { MainLayout } from './layouts/MainLayout';
import './StatisticsView.css';

function StatItem(props: { label: string; text: string }) {
  return (
    <div className="stat-item">
      <p className="stat-item-number">{props.text}</p>
      <p className="stat-item-label">{props.label}</p>
    </div>
  );
}

export function StatisticsView() {
  return (
    <MainLayout title="Statistics">
      <div className="statistics-view">
        <h2 className="stat-heading">Your stats</h2>
        <div className="stat-grid">
          {Array(6)
            .fill(1234)
            .map((v, i) => (
              <StatItem key={i} label="messages" text={v.toString()} />
            ))}
        </div>
        <h2 className="stat-heading">Global stats</h2>
        <div className="stat-grid">
          {Array(6)
            .fill(1234)
            .map((v, i) => (
              <StatItem key={i} label="messages" text={v.toString()} />
            ))}
        </div>
      </div>
    </MainLayout>
  );
}
