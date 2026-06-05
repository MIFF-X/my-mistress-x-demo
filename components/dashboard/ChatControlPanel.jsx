import { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';
import LiveChat from '../chat/LiveChat';

const mockControls = [
  'Active rooms monitor',
  'Paid unlock review',
  'Flagged message queue',
  'Mute / block actions',
  'Live show chat bridge',
  'Socket health feed',
];

export default function ChatControlPanel() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('room-demo-1');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPlaceholderRooms();
  }, []);

  async function loadPlaceholderRooms() {
    setRooms([
      { id: 'room-demo-1', title: 'Demo Room 1', status: 'Live-enabled' },
      { id: 'room-demo-2', title: 'Demo Room 2', status: 'Live-enabled' },
    ]);
  }

  async function loadMessages(roomId) {
    setSelectedRoomId(roomId);
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch(`/chat/messages/${roomId}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessages([]);
      setError(err.message || 'Chat messages failed to load');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-chat-control-panel">
      <header>
        <p className="mx-eyebrow">Chat Control</p>
        <h2>Live Chat Monitor</h2>
      </header>

      <div className="mx-command-grid">
        {mockControls.map((control) => (
          <article key={control} className="mx-command-panel">
            <h3>{control}</h3>
            <p>Prepared for real-time wiring.</p>
          </article>
        ))}
      </div>

      <section className="mx-chat-room-list">
        <h3>Rooms</h3>
        {rooms.map((room) => (
          <article key={room.id} className="mx-chat-room-row">
            <div>
              <strong>{room.title}</strong>
              <small>{room.status}</small>
            </div>
            <button type="button" onClick={() => loadMessages(room.id)}>
              Open
            </button>
          </article>
        ))}
      </section>

      <LiveChat roomId={selectedRoomId} />

      <section className="mx-chat-message-review">
        <h3>Message Review</h3>
        {selectedRoomId && <p>Selected room: {selectedRoomId}</p>}
        {loading && <p>Loading messages...</p>}
        {error && <p className="mx-error">{error}</p>}
        {messages.length === 0 && !loading && <p>No messages loaded.</p>}

        {messages.map((message) => (
          <article key={message.id} className="mx-chat-review-row">
            <strong>{message.senderUserId}</strong>
            <p>{message.body || message.text}</p>
            <div className="mx-panel-actions">
              <button type="button">Flag</button>
              <button type="button">Hide</button>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
