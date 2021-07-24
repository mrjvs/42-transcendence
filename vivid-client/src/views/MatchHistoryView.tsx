import React from 'react';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import './MatchHistoryView.css';
import { MainLayout } from './layouts/MainLayout';
import { Icon } from '../components/styled/Icon';
import { useFetch } from '../hooks/useFetch';
import { UserContext } from '../hooks/useUser';

momentDurationFormatSetup(moment as any);

function MatchRow(props: { currentUser: string; matchData: any }) {
  let icon = { type: 'gamepad', color: 'icon-blue' };
  if (props.matchData?.game_type.toLowerCase() === 'ranked')
    icon = { type: 'bolt', color: 'icon-yellow' };
  else if (props.matchData?.game_type.toLowerCase() === 'duel')
    icon = { type: 'shield', color: 'icon-red' };

  const score1 =
    props.matchData?.user_req_score < 10
      ? `0${props.matchData?.user_req_score}`
      : props.matchData?.user_req_score;
  const score2 =
    props.matchData?.user_acpt_score < 10
      ? `0${props.matchData?.user_acpt_score}`
      : props.matchData?.user_acpt_score;

  return (
    <div className="match-row">
      <div className="match-icon">
        <Icon type={icon.type} className={icon.color} />
        <p>{props.matchData?.game_type.toLowerCase()}</p>
      </div>
      <p className="matches-text">
        {moment
          .duration(props.matchData?.game_ended, 'days')
          .format('d [days]')}
      </p>
      <div>
        {props.matchData?.winner_id === props.currentUser ? (
          <div className="match-icon" style={{ color: '#55B86F' }}>
            <Icon type="checkmark" /> Won
          </div>
        ) : (
          <div className="match-icon" style={{ color: '#E45655' }}>
            <Icon type="cross" /> Lost
          </div>
        )}
      </div>
      <div className="match-scores">
        {score1} - {score2}
      </div>
    </div>
  );
}

function MatchesView() {
  const userData = React.useContext(UserContext);

  const matchHistoryFetch = useFetch({
    runOnLoad: true,
    url: '/api/v1/matches/@me',
    method: 'GET',
  });

  return (
    <div className="matches-view-wrapper">
      <div>
        <h1>Your Matches</h1>
        <div className="matches-card">
          <ul>
            {matchHistoryFetch?.data?.data.map((v: any) => (
              <li key={v.id}>
                <MatchRow currentUser={userData?.user?.id} matchData={v} />
              </li>
            ))}
          </ul>
        </div>
        <p className="matches-text">
          These were all the matches you&apos;ve played
        </p>
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
