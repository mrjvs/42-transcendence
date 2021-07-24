import React from 'react';
import { MessageBox } from '../../components/base/MessageBox';
import { Message, NoMessage } from '../../components/styled/Message';
import { UnusableTextInput } from '../../components/styled/TextInput';
import { UserContext } from '../../hooks/useUser';
import './MessageView.css';

export function MessageView(props: { channelId: string; messageData: any }) {
  const messageData = props.messageData;
  const scrollEl = React.useRef(null);
  const { getRole, currentChannelUser } = messageData;
  const [reducedMessages, setReducedMessages] = React.useState<any[]>([]);
  const { user } = React.useContext(UserContext);

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

    setReducedMessages(() => {
      return messageData.messages.reduce((acc: any[], msg: any) => {
        // if not from this channel, ignore
        if (msg.channel !== props.channelId) return acc;

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
      }, []);
    });
  }, [
    messageData.channelInfo,
    messageData.messages,
    messageData.users,
    messageData.channels,
  ]);

  return (
    <div className="messageViewWrapper">
      <div className="channelScrollWrapper">
        <div id="scroll-area" className="channelContent">
          {messageData.messageState.done ? (
            <>
              <NoMessage />
              <div>
                {reducedMessages.map((v: any) => (
                  <Message
                    key={v.id}
                    channelId={props.channelId}
                    messages={v.messages}
                    blocked={user?.blocks?.includes(v.user)}
                    user={v.userData}
                    tags={[v.userTag]}
                    owner={v.user === currentChannelUser.user.user}
                    channelData={messageData.channelInfo}
                    currentChannelUser={messageData.currentChannelUser}
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
            onSend={(obj: { text: string; type: boolean; extraData?: any }) =>
              messageData.sendMessage(obj.text, obj.type, obj.extraData)
            }
          />
        ) : (
          <UnusableTextInput text="You are muted" />
        )}
      </div>
    </div>
  );
}
