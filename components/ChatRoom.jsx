import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { chatApi } from '../services/chat.api';
import { joinChatRoom, sendChatMessage, onChatMessage } from '../services/socket';

export default function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    init();
  }, [roomId]);

  const init = async () => {
    const me = await apiFetch('/auth/me');
    setUser(me);

    const history = await chatApi.getRoomMessages(roomId);
    setMessages(history);

    joinChatRoom(roomId, me.sub);

    onChatMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });
  };

  const send = () => {
    if (!text || !user) return;

    sendChatMessage({
      roomId,
      senderUserId: user.sub,
      text,
    });

    setText('');
  };

  return (
    <div>
      <h2>Chat</h2>

      {messages.map((m) => (
        <div key={m.id}>
          <b>{m.senderUserId}</b>: {m.body || m.text}
        </div>
      ))}

      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={send}>Send</button>
    </div>
  );
}
