import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { MessageBox } from '../components/base/MessageBox';
import { Message, NoMessage } from '../components/styled/Message';
import { useMessages } from '../hooks/useMessages';
import { MainLayout } from './layouts/MainLayout';
import './ChannelView.css';
import { UserContext } from '../hooks/useUser';
import { Icon } from '../components/styled/Icon';

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
  }, [messageData.channelInfo, messageData.messages, messageData.users]);

  return (
    <MainLayout
      title={
        (messageData.messageState.done && messageData.channelInfo.title) || '‎'
      }
      actions={
        ['owner', 'mod'].includes(currentChannelUser.tag) ? (
          <ChannelEditIcon
            onClick={() => history.push(`/channel/${id}/settings`)}
          />
        ) : null
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
                    owner={v.userTag === 'owner'}
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
