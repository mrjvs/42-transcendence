import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LoadingScreen } from './components/styled/LoadingScreen';
import { ChannelsContext, useChannelsContext } from './hooks/useChannels';
import { useMessageContext, MessageContext } from './hooks/useMessages';
import { StatusContext, useStatusContext } from './hooks/useStatuses';
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
  const statusData = useStatusContext();
  const channelsData = useChannelsContext();

  return (
    <UsersContext.Provider value={usersData}>
      <StatusContext.Provider value={statusData}>
        <ChannelsContext.Provider value={channelsData}>
          <MessageStoreInit>{props.children}</MessageStoreInit>
        </ChannelsContext.Provider>
      </StatusContext.Provider>
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
          <BrowserRouter>
            <LoadingScreen userData={userData}>
              <RootNavigation />
            </LoadingScreen>
          </BrowserRouter>
        </StoreInit>
      </SocketContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
