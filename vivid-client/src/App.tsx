import React from 'react';
import { LoadingScreen } from './components/styled/LoadingScreen';
import { useMessageContext, MessageContext } from './hooks/useMessages';
import { UserContext, useUser } from './hooks/useUser';
import { UsersContext, useUsersContext } from './hooks/useUsers';
import { useWebsocket, SocketContext } from './hooks/useWebsocket';
import { RootNavigation } from './navigation/Root';

function MessageStoreInit(props: { children: any }) {
  const messageData = useMessageContext();
  return (
    <MessageContext.Provider value={messageData}>
      {props.children}
    </MessageContext.Provider>
  );
}

function StoreInit(props: { children: any }) {
  const usersData = useUsersContext();
  return (
    <UsersContext.Provider value={usersData}>
      <MessageStoreInit>{props.children}</MessageStoreInit>
    </UsersContext.Provider>
  );
}

function App() {
  const userData = useUser();
  const socketData = useWebsocket();

  return (
    <UserContext.Provider value={userData}>
      <SocketContext.Provider value={socketData}>
        <StoreInit>
          <LoadingScreen userData={userData}>
            <RootNavigation />
          </LoadingScreen>
        </StoreInit>
      </SocketContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
