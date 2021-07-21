import React from 'react';
import './ActionRow.css';
import { SidebarLink } from '../../../components/styled/sidebar/SidebarLink';
import { Avatar } from '../../../components/styled/Avatar';

export function Friends(props: { userData: any }) {
  return (
    <>
      {props.userData.user.friends
        ?.filter((v: any) => v.accepted)
        .map((v: any) => (
          <div key={v.id}>
            <SidebarLink link="">
              <Avatar isClickable user={v.friend} small={true} />
              <span>{v.friend.name}</span>
            </SidebarLink>
          </div>
        ))}
    </>
  );
}
