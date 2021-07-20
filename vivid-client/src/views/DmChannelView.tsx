import React from 'react';
import { useParams } from 'react-router-dom';
import { useMessages } from '../hooks/useMessages';
import { MainLayout } from './layouts/MainLayout';
import './ChannelView.css';
import { useFetch } from '../hooks/useFetch';
import { NotFoundView } from './NotFoundView';
import { MessageView } from './channel/MessageView';

function ChannelViewLoading(props: { loading: boolean }) {
  if (props.loading) return <p>Loading...</p>;
  else return <NotFoundView>Couldn&apos;t find this dm channel</NotFoundView>;
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
    <MainLayout title="DM channel" actions={null}>
      <MessageView channelId={channelId} messageData={messageData} />
    </MainLayout>
  );
}
