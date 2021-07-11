import React from 'react';
import { useParams } from 'react-router-dom';
import { MessageBox } from '../components/base/MessageBox';
import { Message, NoMessage } from '../components/styled/Message';
import { useMessages } from '../hooks/useMessages';
import { MainLayout } from './layouts/MainLayout';
import './ChannelView.css';

export function ChannelView() {
  const scrollEl = React.useRef(null);
  const { id }: any = useParams();
  const messageData = useMessages(id);
  const [reducedMessages, setReducedMessages] = React.useState<any[]>([]);

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
        messages: [msg.content],
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
        prev.messages.push(msg.content);
        return acc;
      }, []),
    );
  }, [messageData.channelInfo, messageData.messages, messageData.users]);

  return (
    <MainLayout
      title={
        messageData.messageState.done ? messageData.channelInfo.title : '‎'
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
          onSend={(text: string) => messageData.sendMessage(text)}
        />
      </div>
    </MainLayout>
  );
}
