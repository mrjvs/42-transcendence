import React from 'react';
import { useParams } from 'react-router-dom';
import { MessageBox } from '../components/base/MessageBox';
import { Heading } from '../components/styled/Heading';
import { Message, NoMessage } from '../components/styled/Message';
import { useMessages } from '../hooks/useMessages';
import './ChannelView.css';

export function ChannelView() {
  const scrollEl = React.useRef(null);
  const { id }: any = useParams();
  const messageData = useMessages(id);

  React.useEffect(() => {
    const cur: any = scrollEl?.current;
    if (!cur) return;
    setTimeout(() => {
      cur.scrollIntoView({ behavior: 'smooth' });
    }, 1);
  }, [messageData.messages]);

  return (
    <div className="contentContainer">
      <div className="contentHeader">
        <Heading size="small">Channel title</Heading>
      </div>
      <div className="channelWrapper">
        <div className="channelScrollWrapper">
          <div className="channelContent">
            <NoMessage />
            <div>
              {messageData.messageState.done
                ? messageData.messages.map((v: any) => (
                    <Message
                      key={v.id}
                      messages={[v.content]}
                      username="mrjvs"
                      blocked={false}
                    />
                  ))
                : null}
            </div>
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
