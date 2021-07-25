import React from 'react';
import { useFetch } from '../hooks/useFetch';
import { UserContext } from '../hooks/useUser';
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
  const userData = React.useContext(UserContext);

  const matchStatsFetch = useFetch({
    runOnLoad: true,
    url: '/api/v1/matches/@me',
    method: 'GET',
  });

  const userStatsFetch = useFetch({
    runOnLoad: true,
    url: '/api/v1/stats/@me',
    method: 'GET',
  });

  console.log(userStatsFetch?.data?.data);

  const matchesPlayed = matchStatsFetch?.data?.data.length;
  const wonGames = matchStatsFetch?.data?.data.filter(
    (v: any) => v.winner_id === userData.user.id,
  ).length;
  const lostGames = matchStatsFetch?.data?.data.filter(
    (v: any) => v.winner_id !== userData.user.id,
  ).length;

  return (
    <MainLayout title="Statistics">
      <div className="statistics-view">
        <h2 className="stat-heading">Your stats</h2>
        {matchStatsFetch?.done ? (
          <div className="stat-grid">
            <StatItem label="Matches played" text={matchesPlayed} />
            <StatItem label="Won games" text={wonGames} />
            <StatItem label="Lost games" text={lostGames} />
            <StatItem label="Messages sent" text={wonGames} />
            <StatItem label="Secrets clicked" text={wonGames} />
            <StatItem label="Devices logged in" text={wonGames} />
          </div>
        ) : null}
        <h2 className="stat-heading">Global stats</h2>
        <div className="stat-grid">
          <StatItem label="Matches played" text={'252'} />
          <StatItem label="User accounts" text={'42'} />
          <StatItem label="Public channels" text={'210'} />
          <StatItem label="Messages sent" text={'2162'} />
          <StatItem label="Users with 2FA on" text={'25'} />
          <StatItem label="Months spent to make this" text={'3'} />
        </div>
      </div>
    </MainLayout>
  );
}
