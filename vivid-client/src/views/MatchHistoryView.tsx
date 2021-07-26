import React from 'react';
import './MatchHistoryView.css';
import { MainLayout } from './layouts/MainLayout';
import { useFetch } from '../hooks/useFetch';
import { UserContext } from '../hooks/useUser';
import { MatchList } from '../components/styled/MatchList';

function MatchesView() {
  const userData = React.useContext(UserContext);

  const matchHistoryFetch = useFetch({
    runOnLoad: true,
    url: '/api/v1/matches/@me',
    method: 'GET',
  });

  return (
    <div className="matches-view-wrapper">
      <div className="matches-view-container">
        <h1>Your Matches</h1>
        {matchHistoryFetch?.done ? (
          <MatchList
            currentUser={userData?.user?.id}
            matchList={matchHistoryFetch?.data?.data}
          />
        ) : null}
      </div>
    </div>
  );
}

export function MatchHistoryView() {
  return (
    <MainLayout title="Match history">
      <div className="channelScrollWrapper">
        <div id="scroll-area" className="channelContent">
          <MatchesView />
        </div>
      </div>
    </MainLayout>
  );
}
