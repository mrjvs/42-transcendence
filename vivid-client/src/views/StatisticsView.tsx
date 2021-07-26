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
  const userStatsFetch = useFetch({
    runOnLoad: true,
    url: '/api/v1/stats/@me',
    method: 'GET',
  });

  const globalStatsFetch = useFetch({
    runOnLoad: true,
    url: '/api/v1/stats/',
    method: 'GET',
  });

  const matchesPlayed = userStatsFetch?.data?.data.matches_played;
  const wonGames = userStatsFetch?.data?.data.won_games;
  const lostGames = userStatsFetch?.data?.data.lost_games;

  const userMessageCount = userStatsFetch?.data?.data.messages_count;
  const userSecretsCount = userStatsFetch?.data?.data.secrets_count;
  const userSessionCount = userStatsFetch?.data?.data.sessions_count;

  const matchesCount = globalStatsFetch?.data?.data.matches_played;
  const usersCount = globalStatsFetch?.data?.data.users_accounts;
  const publicChannelsCount = globalStatsFetch?.data?.data.public_channels;
  const messagesCount = globalStatsFetch?.data?.data.messages_count;
  const twofaUsersCount = globalStatsFetch?.data?.data.twofa_users;
  const monthsCount = globalStatsFetch?.data?.data.months_coding;

  return (
    <MainLayout title="Statistics">
      <div className="statistics-view">
        <h2 className="stat-heading">Your stats</h2>
        {userStatsFetch?.done ? (
          <div className="stat-grid">
            <StatItem label="Matches played" text={matchesPlayed} />
            <StatItem label="Won games" text={wonGames} />
            <StatItem label="Lost games" text={lostGames} />
            <StatItem label="Messages sent" text={userMessageCount} />
            <StatItem label="Secrets sent" text={userSecretsCount} />
            <StatItem label="Devices logged in" text={userSessionCount} />
          </div>
        ) : null}
        <h2 className="stat-heading">Global stats</h2>
        {globalStatsFetch?.done ? (
          <div className="stat-grid">
            <StatItem label="Matches played" text={matchesCount} />
            <StatItem label="User accounts" text={usersCount} />
            <StatItem label="Public channels" text={publicChannelsCount} />
            <StatItem label="Messages sent" text={messagesCount} />
            <StatItem label="Users with 2FA on" text={twofaUsersCount} />
            <StatItem label="Months spent to make this" text={monthsCount} />
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}
