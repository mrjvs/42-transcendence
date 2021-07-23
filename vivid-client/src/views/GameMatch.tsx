import React from 'react';
import { useHistory } from 'react-router-dom';
import { Icon } from '../components/styled/Icon';
import { useFetch } from '../hooks/useFetch';
import './GameMatch.css';

function LadderCard(props: {
  id: string;
  title: string;
  rank?: string;
  description: string;
  icon: string;
  color: string;
}) {
  const history = useHistory();

  return (
    <div
      className={`ladderCard ladderCard-color-${props.color}`}
      onClick={() => {
        history.push(`/ladder/${props.id}`);
      }}
    >
      <Icon type={props.icon} className="ladderCard-deco" />
      <Icon type={props.icon} className="ladderCard-icon" />
      {props.rank ? <p className="ladderCard-rank">{props.rank}</p> : null}
      <h2 className="ladderCard-title">{props.title}</h2>
      <p className="ladderCard-description">{props.description}</p>
    </div>
  );
}

function LadderCardSkeleton() {
  return <div className="ladderCardSkeleton" />;
}

// TODO show details from ladders
// TODO show current rank on ladder
export function GameMatchView() {
  const ladderMatch = useFetch({
    runOnLoad: true,
    url: `/api/v1/ladder`,
    method: 'GET',
  });

  if (ladderMatch.error)
    return (
      <div className="GameMatchView">
        <h1 className="GameMatchView-heading">Failed to load rankings</h1>
      </div>
    );

  if (ladderMatch.loading)
    return (
      <div className="GameMatchView">
        <h1 className="GameMatchView-heading">
          What type of match do you want to play?
        </h1>
        <div className="GameMatchView-cards">
          <LadderCardSkeleton />
          <LadderCardSkeleton />
        </div>
      </div>
    );

  return (
    <div className="GameMatchView">
      <h1 className="GameMatchView-heading">
        What type of match do you want to play?
      </h1>
      <div className="GameMatchView-cards">
        {ladderMatch.data?.data?.map((v: any) => (
          <LadderCard
            title="Casual match"
            description="Just a normal match with random people"
            icon="gamepad"
            color="blue"
            id={v.id}
            key={v.id}
          />
        ))}
        {/* <LadderCard
          title="Competitive match"
          description="Fight to the best of your ability against your foes"
          icon="bolt"
          color="yellow"
          rank="Gold"
          id="competitive"
        /> */}
      </div>
    </div>
  );
}
