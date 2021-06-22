// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import socketIOClient from 'socket.io-client';

// function InputBox(props: {
//   channel: string;
//   onSend: () => void;
//   onReceive: (msg: any) => void;
// }) {
//   const [error, setError] = useState(false);
//   const [isLoading, setLoading] = useState(false);
//   const [content, setContent] = useState('');
//   const [clientState, setClientState] = useState('CONNECTING');

//   function sendMessage() {
//     setLoading(true);
//     setError(false);
//     fetch(`http://localhost:8080/api/v1/channels/${props.channel}/messages`, {
//       method: 'POST',
//       credentials: 'include',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         user: '4f166638-410b-419c-9aad-bb6306f80c10',
//         content,
//       }),
//     })
//       .then((res) => res.json())
//       .then(() => {
//         setLoading(false);
//         setContent('');
//         props.onSend();
//       })
//       .catch(() => {
//         setLoading(false);
//         setError(true);
//       });
//     return false;
//   }

//   React.useEffect(() => {
//     const client = socketIOClient('http://localhost:8080', {
//       withCredentials: true,
//       path: '/api/v1/events',
//     });

//     client.on('connect', () => {
//       setClientState('CONNECTED');
//     });

//     client.on('channel_message', (data: any) => {
//       if (data?.channel === props.channel) props.onReceive(data);
//     });

//     client.on('disconnect', () => {
//       setClientState('DISCONNECTED');
//     });

//     return () => {
//       client.destroy();
//     };
//   }, []);

//   const buttonText = isLoading ? 'Sending...' : 'Send';
//   let errorRender = <div></div>;
//   if (error) errorRender = <p>Something went wrong, try again later</p>;

//   return (
//     <>
//       <p>Weboscket state: {clientState}</p>
//       <form onSubmit={onSubmit}>
//         {errorRender}
//         <input
//           onChange={onChange}
//           value={content}
//           type="text"
//           placeholder="hello world..."
//         />
//         <button>{buttonText}</button>
//       </form>
//     </>
//   );
// }

// interface IMessage {
//   id: string;
//   content: string;
//   user: string;
// }
// export function ChannelView() {
//   const { id }: any = useParams();

//   const [error, setError] = useState(false);
//   const [messages, setMessages] = useState<{ msg: IMessage[] }>({ msg: [] });
//   const [isLoading, setLoading] = useState(true);

//   function requestMessages() {
//     setLoading(true);
//     setError(false);
//     fetch(`http://localhost:8080/api/v1/channels/${id}/messages`, {
//       credentials: 'include',
//     })
//       .then((res) => res.json())
//       .then((result) => {
//         setLoading(false);
//         setMessages({ msg: result });
//       })
//       .catch(() => {
//         setLoading(false);
//         setError(true);
//       });
//   }

//   useEffect(() => {
//     requestMessages();
//   }, []);

//   return (
//     <div>
//       {React.useMemo(() => {
//         if (isLoading)
//           return (
//             <div>
//               <p>Loading messages...</p>
//             </div>
//           );
//         else if (error)
//           return (
//             <div>
//               <p>Something went wrong, try again later</p>
//             </div>
//           );
//         return (
//           <div>
//             <ul>
//               {messages.msg.map((v) => (
//                 <li key={v.id}>
//                   <p>
//                     <b>{v.user}:</b> {v.content}
//                   </p>
//                   <hr />
//                 </li>
//               ))}
//             </ul>
//           </div>
//         );
//       }, [messages, isLoading, error])}
//       <hr />
//       {React.useMemo(() => {
//         return (
//           <InputBox
//             channel={id}
//             onSend={() => {
//               console.log('sending...');
//             }}
//             onReceive={(msg: any) => {
//               setMessages((old) => ({ msg: [...old.msg, msg] }));
//             }}
//           />
//         );
//       }, [id])}
//     </div>
//   );
// }
export {};
