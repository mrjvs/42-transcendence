import React from 'react';
import moment from 'moment';
import { Icon } from './Icon';
import './MatchList.css';

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
        {moment(props.matchData?.game_ended).fromNow()}
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
        {props.matchData?.user_req === props.currentUser
          ? `${score1} - ${score2}`
          : `${score2} - ${score1}`}
      </div>
    </div>
  );
}

export function MatchList(props: { currentUser: string; matchList: any }) {
  if (props.matchList.length == 0) {
    return (
      <div className="match-list-container">
        <div className="match-list-wrapper">
          <ul>
            <li>
              <div className="match-row">
                <p className="matches-text text-centered">No matches found</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="match-list-container">
      <div className="match-list-wrapper">
        <ul>
          {props.matchList.map((v: any) => (
            <li key={v.id}>
              <MatchRow currentUser={props.currentUser} matchData={v} />
            </li>
          ))}
        </ul>
      </div>
      <div className="bottom-text-wrapper">
        <p className="matches-text">
          These were all the matches you&apos;ve played
        </p>
      </div>
    </div>
  );
}
