import React from 'react';
import './ActionRow.css';
import { SidebarLink } from '../../../components/styled/sidebar/SidebarLink';
import { Avatar } from '../../../components/styled/Avatar';
import { UsersContext } from '../../../hooks/useUsers';

export function Friends(props: { userData: any; openModal: () => void }) {
  const { getUser } = React.useContext(UsersContext);

  return (
    <div>
      {props.userData.user.friends
        ?.filter((v: any) => v.accepted)
        .map((v: any) => (
          <div key={v.id}>
            <SidebarLink link={`/dm/${v.friend.id}`}>
              <div className="friend-list-sidebar">
                <Avatar user={getUser(v.friend.id)?.data} small={true} />
                <span>
                  {getUser(v.friend.id)?.data?.name || 'unknown user'}
                </span>
              </div>
            </SidebarLink>
          </div>
        ))}
      {props.userData.user.friends?.filter((v: any) => v.accepted).length ==
      0 ? (
        <SidebarLink
          click={() => props.openModal()}
          description="Click here to add a few"
          icon="user_friends"
        >
          No friends?
        </SidebarLink>
      ) : null}
    </div>
  );
}
