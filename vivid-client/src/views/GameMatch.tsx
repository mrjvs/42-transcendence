import React from 'react';
import { useHistory } from 'react-router-dom';
import { Icon } from '../components/styled/Icon';
import { useFetch } from '../hooks/useFetch';
import { MainLayout } from './layouts/MainLayout';
import './GameMatch.css';
import { UserContext } from '../hooks/useUser';

function LadderCard(props: {
  id: string;
  title: string;
  rank?: { name: string; color: string };
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
      {props.rank ? (
        <p
          className={`ladderCard-rank ladderCard-rank-color-${props.rank.color}`}
        >
          {props.rank.name}
        </p>
      ) : null}
      <h2 className="ladderCard-title">{props.title}</h2>
      <p className="ladderCard-description">{props.description}</p>
    </div>
  );
}

function LadderCardSkeleton() {
  return <div className="ladderCardSkeleton" />;
}

function getLadderRank(ladder: string, ladderUsers: any[]) {
  const found = ladderUsers.find((v) => v.ladder.id === ladder);
  if (!found) return { name: 'unranked', color: '' };
  return {
    name: found.rank.displayName,
    color: found.rank.color,
  };
}

export function GameMatchView() {
  const userData = React.useContext(UserContext);
  const ladderMatch = useFetch({
    runOnLoad: true,
    url: `/api/v1/ladder/all`,
    method: 'GET',
  });

  React.useEffect(() => {
    ladderMatch.run();
  }, [userData.user.name]);

  const ladders = ladderMatch.data?.data?.ladders;
  const ladderUsers = ladderMatch.data?.data?.ladderUsers;

  if (ladderMatch.error)
    return (
      <div className="GameMatchView">
        <h1 className="GameMatchView-heading">Failed to load rankings</h1>
      </div>
    );

  if (ladderMatch.loading)
    return (
      <MainLayout title="" background="#1b1f31">
        <div className="GameMatchView">
          <h1 className="GameMatchView-heading">
            What type of match do you want to play?
          </h1>
          <div className="GameMatchView-cards">
            <LadderCardSkeleton />
            <LadderCardSkeleton />
          </div>
        </div>
      </MainLayout>
    );

  return (
    <MainLayout title="" background="#1b1f31">
      <div className="GameMatchView">
        <h1 className="GameMatchView-heading">
          What type of match do you want to play?
        </h1>
        <div className="GameMatchView-cards">
          {ladders?.map((v: any) => (
            <LadderCard
              title={v.details?.title || 'Play a match'}
              description={
                v.details?.description ||
                'Just a normal match with random people'
              }
              icon={v.details?.icon || 'gamepad'}
              color={v.details?.color || 'blue'}
              rank={
                v?.type === 'ranked'
                  ? getLadderRank(v.id, ladderUsers)
                  : undefined
              }
              id={v.id}
              key={v.id}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
