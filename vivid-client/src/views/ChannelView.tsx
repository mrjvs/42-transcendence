import React from 'react';
import { useParams } from 'react-router-dom';
import { MessageBox } from '../components/base/MessageBox';
import { Heading } from '../components/styled/Heading';
import { Message, NoMessage } from '../components/styled/Message';
import { useMessages } from '../hooks/useMessages';
import './ChannelView.css';
import { UserContext } from '../hooks/useUser';

export function ChannelView() {
  const scrollEl = React.useRef(null);
  const { id }: any = useParams();
  const messageData = useMessages(id);
  const [reducedMessages, setReducedMessages] = React.useState<any[]>([]);
  const { user } = React.useContext(UserContext);

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
    <div className="contentContainer">
      <div className="contentHeader">
        <Heading size="small">
          {messageData.messageState.done ? messageData.channelInfo.title : '‎'}
        </Heading>
      </div>
      <div className="channelWrapper">
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
                      messageId={v.id}
                      messages={v.messages}
                      username={v.userData.name}
                      blocked={false}
                      userColors={v.userData.avatar_colors}
                      owner={v.userData.id === user.id ? true : false}
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
      </div>
    </div>
  );
}
