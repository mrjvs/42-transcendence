import React from 'react';
import { useParams } from 'react-router-dom';
import { MessageBox } from '../components/base/MessageBox';
import { Message, NoMessage } from '../components/styled/Message';
import { useMessages } from '../hooks/useMessages';
import { MainLayout } from './layouts/MainLayout';
import './ChannelView.css';
import { UserContext } from '../hooks/useUser';

export function ChannelView() {
  const scrollEl = React.useRef(null);
  const { id }: any = useParams();
  const messageData = useMessages(id);
  const userData = React.useContext(UserContext);
  const [reducedMessages, setReducedMessages] = React.useState<any[]>([]);
  const [currentUser, setCurrentUser] = React.useState<{
    user?: any | null;
    tag?: string | null;
  }>({ user: null, tag: null });

  function getRole(userId: string) {
    let tag = null;
    const channelUser = messageData?.channelInfo?.joined_users.find(
      (v: any) => v.user?.id === userId || v.user === userId,
    );
    if (channelUser && channelUser.is_mod) tag = 'mod';
    if (userId === messageData?.channelInfo?.owner) tag = 'owner';
    return tag;
  }

  React.useEffect(() => {
    if (!messageData?.channelInfo || !userData.user?.id) {
      setCurrentUser({ user: null, tag: null });
      return;
    }
    const n = {
      user: messageData?.channelInfo?.joined_users?.find(
        (v: any) =>
          v.user?.id === userData.user?.id || v.user === userData.user?.id,
      ),
      tag: currentUser ? getRole(userData.user?.id) : null,
    };
    setCurrentUser(n);
  }, [messageData.channelInfo, userData]);

  React.useEffect(() => {
    const cur: any = scrollEl?.current;
    if (!cur) return;
    setTimeout(() => {
      cur.scrollIntoView();
    }, 1);
  }, [reducedMessages]);

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
        });
        return acc;
      }, []),
    );
  }, [messageData.channelInfo, messageData.messages, messageData.users]);

  return (
    <MainLayout
      title={
        (messageData.messageState.done ? messageData.channelInfo.title : '‎') +
        (currentUser.tag && ['owner', 'mod'].includes(currentUser.tag)
          ? 'Edit channel'
          : '')
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
                    messages={v.messages}
                    user={v.userData}
                    blocked={false}
                    tag={v.userTag}
                  />
                ))}
              </div>
            </>
          ) : null}
          <div ref={scrollEl} />
        </div>
      </div>
      <div className="channelBottomWrapper">
        <MessageBox
          placeholder="Type your message here..."
          disabled={!messageData.messageState.done}
          onSend={(obj: { text: string; type: boolean }) =>
            messageData.sendMessage(obj.text, obj.type)
          }
        />
      </div>
    </MainLayout>
  );
}
