import React from 'react';
import { useFetch } from '../hooks/useFetch';
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
  const matchStatsFetch = useFetch({
    runOnLoad: true,
    url: '/api/v1/matches/@me',
    method: 'GET',
  });

  const matchesPlayed = matchStatsFetch?.data?.data.length;
  const wonGames = '0';

  return (
    <MainLayout title="Statistics">
      <div className="statistics-view">
        <h2 className="stat-heading">Your stats</h2>
        <div className="stat-grid">
          <StatItem label="Matches played" text={matchesPlayed} />
          <StatItem label="Won games" text={wonGames} />
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
