import React from 'react';
import { useParams } from 'react-router-dom';
import { useMessages } from '../hooks/useMessages';
import { MainLayout } from './layouts/MainLayout';
import './ChannelView.css';
import { useFetch } from '../hooks/useFetch';
import { LoadingView } from './LoadingView';
import { MessageView } from './channel/MessageView';

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

  const friendUser = messageData.getUser(id);

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

  // TODO if no longer friend, redirect to home

  if (!messageData?.currentChannelUser?.user?.is_joined)
    return <ChannelViewLoading loading={false} />;

  return (
    <MainLayout title={friendUser?.data?.name || 'DM channel'} actions={null}>
      <MessageView channelId={channelId} messageData={messageData} />
    </MainLayout>
  );
}
