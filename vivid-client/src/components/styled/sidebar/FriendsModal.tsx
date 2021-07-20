import React from 'react';
import './ActionRow.css';
import { SidebarLink } from '../../../components/styled/sidebar/SidebarLink';
import { Avatar } from '../../../components/styled/Avatar';
import { UserContext } from '../../../hooks/useUser';
import { ModalBase } from '../modals/ModalBase';

export function FriendsModal(props: {
  user: any;
  open: boolean;
  close: () => void;
}) {
  const user = React.useContext(UserContext);

  return (
    <ModalBase
      isOpen={props.open}
      width={450}
      onBackPress={() => props.close()}
    >
      {user.user.friends
        ?.filter((v: any) => !v.accepted)
        .map((v: any) => {
          return (
            <div key={v.id}>
              <SidebarLink link="">
                <Avatar isClickable user={v.friend} small={true} />
                <span>{v.friend.name}</span>
              </SidebarLink>
            </div>
          );
        })}
    </ModalBase>
  );
}
