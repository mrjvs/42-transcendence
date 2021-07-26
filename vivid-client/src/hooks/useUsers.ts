import React from 'react';
// import { SocketContext } from './useWebsocket';

export const UsersContext = React.createContext<any>([]);
UsersContext.displayName = 'UsersContext';

export function useUsersContext() {
  const [users, setUsers] = React.useState<any[]>([]);

  function addUser(user: any) {
    setUsers((prev) => {
      const list = [...prev];
      let found = list.find((v) => v.id === user.id);
      if (!found) {
        found = {
          data: user,
          id: user.id,
        };
        list.push(found);
      }
      found.data = user;
      return list;
    });
  }

  function getUser(userId: string) {
    const found = users.find((v) => v.id === userId);
    if (!found) return false;
    return found;
  }

  return {
    users,
    addUser,
    getUser,
  };
}
