import React from 'react';
import { UserContext } from './useUser';
import { SocketContext } from './useWebsocket';

export function FriendProvider(props: { children: any }) {
  const userData = React.useContext(UserContext);
  const { client } = React.useContext(SocketContext);

  function friendshipUpdate(data: any) {
    const friend =
      data.user_1.id === userData.user.id ? data.user_2 : data.user_1;
    userData.updateUser({
      friends: [
        ...userData.user.friends.filter((v: any) => v.id != data.id),
        {
          ...data,
          friend: friend,
          userId: userData.user.id,
        },
      ],
    });
  }

  function friendshipRemove(id: string) {
    userData.updateUser({
      friends: [...userData.user.friends.filter((v: any) => v.id != id)],
    });
  }

  React.useEffect(() => {
    if (client) {
      client.on('friendship_update', friendshipUpdate);
      client.on('friendship_remove', friendshipRemove);
    }
    return () => {
      if (client) {
        client.off('friendship_update', friendshipUpdate);
        client.off('friendship_remove', friendshipRemove);
      }
    };
  });

  return props.children;
}
