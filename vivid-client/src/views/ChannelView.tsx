import React from 'react';
import { MessageBox } from '../components/base/MessageBox';
import { Heading } from '../components/styled/Heading';
import { Message, NoMessage } from '../components/styled/Message';
import './ChannelView.css';

export function ChannelView() {
  const scrollEl = React.useRef(null);

  React.useEffect(() => {
    (scrollEl?.current as any).scrollIntoView();
  }, []);

  return (
    <div className="contentContainer">
      <div className="contentHeader">
        <Heading size="small">Channel title</Heading>
      </div>
      <div className="channelWrapper">
        <div className="channelScrollWrapper">
          <div className="channelContent">
            <NoMessage />
            <Message
              blocked={false}
              username="mrjvs"
              messages={[
                'This is my text message',
                'This is another message that gets joined together',
              ]}
            />
            <Message
              blocked={false}
              username="mrjvs"
              messages={[
                'This is my text message',
                'This is another message that gets joined together',
              ]}
            />
            <Message
              blocked={false}
              username="mrjvs"
              messages={['This is my text message']}
            />
            <Message
              blocked={true}
              username="mrjvs"
              messages={['This is my text message']}
            />
            <div ref={scrollEl} />
          </div>
        </div>
        <div className="channelBottomWrapper">
          <MessageBox
            placeholder="Type your message here..."
            disabled={false}
            onSend={() => alert('sending')}
          />
        </div>
      </div>
    </div>
  );
}
