import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { MessageBox } from '../components/base/MessageBox';
import { Message, NoMessage } from '../components/styled/Message';
import { useMessages } from '../hooks/useMessages';
import { MainLayout } from './layouts/MainLayout';
import './ChannelView.css';
import { UserContext } from '../hooks/useUser';
import { Icon } from '../components/styled/Icon';
import { UnusableTextInput } from '../components/styled/TextInput';
import { useFetch } from '../hooks/useFetch';
import { NotFoundView } from './NotFoundView';

function ChannelViewLoading(props: { loading: boolean }) {
  if (props.loading) return <p>Loading...</p>;
  else return <NotFoundView>Couldn&apos;t find this channel</NotFoundView>;
}

function ChannelLeaveIcon(props: { onClick?: () => void }) {
  return (
    <span className="channelViewEdit red" onClick={props.onClick}>
      <Icon type="leave" />
    </span>
  );
}

function ChannelEditIcon(props: { onClick?: () => void }) {
  return (
    <span className="channelViewEdit" onClick={props.onClick}>
      <Icon type="gear" />
    </span>
  );
}

export function ChannelView() {
  const scrollEl = React.useRef(null);
  const { id }: any = useParams();
  const history = useHistory();
  const messageData = useMessages(id);
  const { getRole, currentChannelUser } = messageData;
  const [reducedMessages, setReducedMessages] = React.useState<any[]>([]);
  const { user } = React.useContext(UserContext);

  const leaveChannelFetch = useFetch({
    url: '',
    method: 'DELETE',
  });

  React.useLayoutEffect(() => {
    const cur: any = scrollEl?.current;
    if (!cur) return;
    setTimeout(() => {
      cur.scrollIntoView();
    }, 1);
  }, [reducedMessages, scrollEl]);

  React.useEffect(() => {
    if (!messageData.messages) setReducedMessages([]);
    function pushMessageCollection(acc: any[], msg: any) {
      acc.push({
        id: msg.id,
        user: msg.user,
        userData: messageData.getUser(msg.user)?.data || {
          name: 'Unknown user',
          avatar_colors: ['', ''],
          id: msg.user,
        },
        userTag: getRole(msg.user),
        messages: [
          {
            content: msg.content,
            aux_content: msg.aux_content,
            type: msg.message_type,
            id: msg.id,
          },
        ],
        createdAt: new Date(msg.created_at),
      });
    }

    setReducedMessages(
      messageData.messages.reduce((acc: any[], msg: any) => {
        // if not from this channel, ignore
        if (msg.channel !== id) return acc;

        // if no messages yet or previous message collection is not the same user. add new message collection
        if (acc.length == 0 || acc[acc.length - 1].user !== msg.user) {
          pushMessageCollection(acc, msg);
          return acc;
        }

        const prev = acc[acc.length - 1];
        // if first message in collection is more than 4 minutes away than current message. create new collection
        if (
          new Date(msg.created_at).getTime() - prev.createdAt.getTime() >
          1000 * 60 * 4
        ) {
          pushMessageCollection(acc, msg);
          return acc;
        }

        // append to previous message collection
        prev.messages.push({
          content: msg.content,
          aux_content: msg.aux_content,
          type: msg.message_type,
          id: msg.id,
        });
        return acc;
      }, []),
    );
  }, [
    messageData.channelInfo,
    messageData.messages,
    messageData.users,
    messageData.channels,
  ]);

  React.useEffect(() => {
    if (leaveChannelFetch.done) {
      // TODO update joined channel list
      leaveChannelFetch.reset();
    }
  }, [leaveChannelFetch.done]);

  if (messageData.messageState.error || messageData.messageState.loading)
    return <ChannelViewLoading loading={!!messageData.messageState.loading} />;

  if (!messageData?.currentChannelUser?.user?.is_joined)
    return <ChannelViewLoading loading={false} />;

  return (
    <MainLayout
      title={
        (messageData.messageState.done && messageData.channelInfo.title) || '‎'
      }
      actions={
        <div>
          {['owner', 'mod'].includes(currentChannelUser.tag) ? (
            <ChannelEditIcon
              onClick={() => history.push(`/channel/${id}/settings`)}
            />
          ) : null}
          <ChannelLeaveIcon
            onClick={() =>
              leaveChannelFetch.run(
                null,
                `/api/v1/channels/${id}/users/${currentChannelUser.user.user}`,
              )
            }
          />
        </div>
      }
    >
      <div className="channelScrollWrapper">
        <div className="channelContent">
          {messageData.messageState.done ? (
            <>
              <NoMessage />
              <div>
                {reducedMessages.map((v: any) => (
                  <Message
                    key={v.id}
                    channelId={id}
                    messages={v.messages}
                    blocked={user?.blocks?.includes(v.user)}
                    user={v.userData}
                    tags={[v.userTag]}
                    owner={v.user === currentChannelUser.user.user}
                  />
                ))}
              </div>
            </>
          ) : null}
          <div ref={scrollEl} />
        </div>
      </div>
      <div className="channelBottomWrapper">
        {!currentChannelUser?.user?.is_muted ? (
          <MessageBox
            placeholder="Type your message here..."
            disabled={!messageData.messageState.done}
            onSend={(obj: { text: string; type: boolean }) =>
              messageData.sendMessage(obj.text, obj.type)
            }
          />
        ) : (
          <UnusableTextInput text="You are muted" />
        )}
      </div>
    </MainLayout>
  );
}
