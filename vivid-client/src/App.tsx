import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LoadingScreen } from './components/styled/LoadingScreen';
import {
  ChannelClientListener,
  ChannelsContext,
  useChannelsContext,
} from './hooks/useChannels';
import { FriendProvider } from './hooks/useFriends';
import { GameEventContext, useGameEvents } from './hooks/useGameEvents';
import { useMessageContext, MessageContext } from './hooks/useMessages';
import { StatusContext, useStatusContext } from './hooks/useStatuses';
import { UserContext, useUser } from './hooks/useUser';
import { UsersContext, useUsersContext } from './hooks/useUsers';
import { useWebsocket, SocketContext } from './hooks/useWebsocket';
import { RootNavigation } from './navigation/Root';

function MessageStoreInit(props: { children: any }) {
  const messageData = useMessageContext();

  return (
    <ChannelClientListener>
      <MessageContext.Provider value={messageData}>
        <FriendProvider>{props.children}</FriendProvider>
      </MessageContext.Provider>
    </ChannelClientListener>
  );
}

function StoreInit(props: { children: any }) {
  const statusData = useStatusContext();
  const gameEventData = useGameEvents();

  return (
    <GameEventContext.Provider value={gameEventData}>
      <StatusContext.Provider value={statusData}>
        <MessageStoreInit>{props.children}</MessageStoreInit>
      </StatusContext.Provider>
    </GameEventContext.Provider>
  );
}

function ChannelStoreInit(props: { children: any }) {
  const channelsData = useChannelsContext();

  return (
    <ChannelsContext.Provider value={channelsData}>
      <ClientStoreInit>{props.children}</ClientStoreInit>
    </ChannelsContext.Provider>
  );
}

function PureStoreInit(props: { children: any }) {
  const usersData = useUsersContext();

  return (
    <UsersContext.Provider value={usersData}>
      <ChannelStoreInit>{props.children}</ChannelStoreInit>
    </UsersContext.Provider>
  );
}

function ClientStoreInit(props: { children: any }) {
  const userData = useUser();
  const socketData = useWebsocket();

  return (
    <UserContext.Provider value={userData}>
      <SocketContext.Provider value={socketData}>
        <StoreInit>
          <BrowserRouter>
            <LoadingScreen userData={userData}>{props.children}</LoadingScreen>
          </BrowserRouter>
        </StoreInit>
      </SocketContext.Provider>
    </UserContext.Provider>
  );
}

function App() {
  return (
    <PureStoreInit>
      <RootNavigation />
    </PureStoreInit>
  );
}

export default App;
