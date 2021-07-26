import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useMessages } from '../hooks/useMessages';
import { MainLayout } from './layouts/MainLayout';
import './ChannelView.css';
import { useFetch } from '../hooks/useFetch';
import { LoadingView } from './LoadingView';
import { MessageView } from './channel/MessageView';
import { UserContext } from '../hooks/useUser';

function ChannelViewLoading(props: { loading: boolean }) {
  if (props.loading)
    return (
      <LoadingView icon fadein>
        Loading channel
      </LoadingView>
    );
  return <LoadingView>Couldn&apos;t find this channel</LoadingView>;
}

export function DmChannelView() {
  const { id }: any = useParams();
  const dmChannelFetch = useFetch({
    url: `/api/v1/dms/${id}`,
    method: 'GET',
    runOnLoad: true,
  });
  const channelId = dmChannelFetch.done ? dmChannelFetch.data.data.id : null;
  const messageData = useMessages(channelId);
  const userData = React.useContext(UserContext);
  const history = useHistory();

  React.useEffect(() => {
    dmChannelFetch.reset();
    dmChannelFetch.run();
  }, [id]);

  const friendUser = messageData.getUser(id);

  // if no longer friend, redirect to home
  React.useEffect(() => {
    const found = userData.user.friends.find((v: any) => v.friend.id === id);
    if (!found) history.push('/');
  }, [userData.user.friends]);

  if (
    messageData.messageState.error ||
    messageData.messageState.loading ||
    dmChannelFetch.loading ||
    dmChannelFetch.error
  )
    return (
      <ChannelViewLoading
        loading={!messageData.messageState.error && !dmChannelFetch.error}
      />
    );

  if (!messageData?.currentChannelUser?.user?.is_joined)
    return <ChannelViewLoading loading={false} />;

  return (
    <MainLayout title={friendUser?.data?.name || 'DM channel'} actions={null}>
      <MessageView channelId={channelId} messageData={messageData} />
    </MainLayout>
  );
}
