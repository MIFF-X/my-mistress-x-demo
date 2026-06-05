import { useEffect, useState } from 'react';
import {
  joinChatRoom,
  leaveChatRoom,
  offChatMessage,
  onChatMessage,
  sendChatMessage,
} from '../../services/socket';

export default function LiveChat({ roomId = 'room-demo-1', userId = 'headmistress-preview' }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!roomId) return undefined;

    function handleMessage(message) {
      if (message?.roomId && message.roomId !== roomId) return;
      setMessages((current) => [...current, message]);
    }

    joinChatRoom(roomId, userId);
    onChatMessage(handleMessage);

    return () => {
      offChatMessage(handleMessage);
      leaveChatRoom(roomId);
    };
  }, [roomId, userId]);

  function send() {
    if (!text.trim()) return;

    sendChatMessage({
      roomId,
      senderUserId: userId,
      text: text.trim(),
    });

    setText('');
  }

  return (
    <section className="mx-live-chat">
      <header>
        <h3>Live Chat Feed</h3>
        <small>Room: {roomId}</small>
      </header>

      <div className="mx-live-chat-feed">
        {messages.length === 0 && <p>No live messages yet.</p>}
        {messages.map((message, index) => (
          <article key={message.id || index} className="mx-chat-review-row">
            <strong>{message.senderUserId || 'unknown'}</strong>
            <p>{message.body || message.text || message.content}</p>
          </article>
        ))}
      </div>

      <div className="mx-chat-input">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') send();
          }}
          placeholder="Type a live test message..."
        />
        <button type="button" onClick={send}>Send</button>
      </div>
    </section>
  );
}
