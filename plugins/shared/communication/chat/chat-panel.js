import { chatApi } from './chat-api.js';
import { createReportButton } from '../../../../features/dashboard/report-action.js';

function createButton(label, className = 'button-secondary') {
  const button = document.createElement('button');
  button.className = className;
  button.innerText = label;
  return button;
}

function createMessageRow(message, statusEl) {
  const row = document.createElement('div');
  row.className = 'chat-message-row panel';

  const meta = document.createElement('small');
  meta.innerText = `${message.type || 'FREE'} · ${message.createdAt || ''}`;

  const body = document.createElement('p');
  body.innerText = message.body || message.text || '';

  const reportButton = createReportButton({
    label: 'Report message',
    title: 'Reported chat message',
    description: message.body || message.text || 'Chat message reported from chat panel.',
    targetType: 'chat',
    targetId: message.id,
    targetUserId: message.senderUserId,
    area: 'CHAT',
    priority: 'HIGH',
    metadata: {
      roomId: message.roomId,
      messageType: message.type,
    },
    onCreated: () => {
      if (statusEl) statusEl.innerText = 'Message report sent to moderation.';
    },
    onError: (error) => {
      if (statusEl) statusEl.innerText = error.message || 'Could not report message.';
    },
  });

  row.appendChild(meta);
  row.appendChild(body);
  row.appendChild(reportButton);

  return row;
}

function formatPresence(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) return 'No active presence yet.';
  return rows
    .map((row) => `${row.userId}${row.isTyping ? ' is typing' : ' seen'}${row.lastSeenAt ? ` · ${new Date(row.lastSeenAt).toLocaleTimeString()}` : ''}`)
    .join(' | ');
}

export function createChatPanel({ initialRoomId = null, receiverUserId = null, unlockCost = 10 } = {}) {
  const shell = document.createElement('section');
  shell.className = 'page-shell chat-panel';

  let currentRoomId = initialRoomId;
  let lastMessageId = null;

  const title = document.createElement('h2');
  title.innerText = 'Messages';

  const status = document.createElement('p');
  status.className = 'chat-status';
  status.innerText = currentRoomId ? `Room: ${currentRoomId}` : 'No room loaded yet.';

  const presenceStatus = document.createElement('p');
  presenceStatus.className = 'chat-presence-status muted-text';
  presenceStatus.innerText = 'Presence not loaded.';

  const unreadStatus = document.createElement('p');
  unreadStatus.className = 'chat-unread-status muted-text';
  unreadStatus.innerText = 'Unread count not loaded.';

  const controls = document.createElement('div');
  controls.className = 'button-row';

  const createRoomBtn = createButton('Create Room', 'button-primary');
  const refreshBtn = createButton('Refresh Messages');
  const unlockBtn = createButton('Unlock Chat');
  const markReadBtn = createButton('Mark Read');
  const heartbeatBtn = createButton('Heartbeat');
  const typingBtn = createButton('Typing Pulse');
  const reportRoomBtn = createReportButton({
    label: 'Report chat room',
    title: 'Reported chat room',
    description: 'Chat room reported from chat panel.',
    targetType: 'chat',
    targetId: currentRoomId,
    targetUserId: receiverUserId,
    area: 'CHAT',
    priority: 'HIGH',
    metadata: { roomId: currentRoomId },
    onCreated: () => {
      status.innerText = 'Chat room report sent to moderation.';
    },
    onError: (error) => {
      status.innerText = error.message || 'Could not report chat room.';
    },
  });

  controls.appendChild(createRoomBtn);
  controls.appendChild(refreshBtn);
  controls.appendChild(markReadBtn);
  controls.appendChild(heartbeatBtn);
  controls.appendChild(typingBtn);

  if (receiverUserId) {
    controls.appendChild(unlockBtn);
  }

  controls.appendChild(reportRoomBtn);

  const messages = document.createElement('div');
  messages.className = 'chat-message-list';

  const inputRow = document.createElement('div');
  inputRow.className = 'chat-input-row';

  const input = document.createElement('input');
  input.className = 'input-field';
  input.placeholder = 'Type a message...';

  const sendBtn = createButton('Send', 'button-primary');

  inputRow.appendChild(input);
  inputRow.appendChild(sendBtn);

  const error = document.createElement('p');
  error.className = 'form-error';
  error.style.display = 'none';

  function setError(message) {
    error.innerText = message;
    error.style.display = message ? 'block' : 'none';
  }

  async function refreshPresence() {
    if (!currentRoomId) return;
    try {
      const rows = await chatApi.getPresence(currentRoomId);
      presenceStatus.innerText = formatPresence(rows);
    } catch (err) {
      presenceStatus.innerText = err.message || 'Could not load presence.';
    }
  }

  async function refreshUnread() {
    if (!currentRoomId) return;
    try {
      const result = await chatApi.getUnreadCount(currentRoomId);
      const count = typeof result === 'number' ? result : result.count ?? result.unreadCount ?? result;
      unreadStatus.innerText = `Unread: ${count}`;
    } catch (err) {
      unreadStatus.innerText = err.message || 'Could not load unread count.';
    }
  }

  async function loadMessages() {
    if (!currentRoomId) return;

    setError('');
    messages.innerHTML = '';

    try {
      const rows = await chatApi.listMessages(currentRoomId);

      if (!Array.isArray(rows) || rows.length === 0) {
        lastMessageId = null;
        const empty = document.createElement('p');
        empty.innerText = 'No messages yet.';
        messages.appendChild(empty);
        await refreshPresence();
        await refreshUnread();
        return;
      }

      lastMessageId = rows[rows.length - 1]?.id || null;
      rows.forEach((message) => messages.appendChild(createMessageRow(message, status)));
      await refreshPresence();
      await refreshUnread();
    } catch (err) {
      setError(err.message || 'Could not load messages.');
    }
  }

  createRoomBtn.onclick = async () => {
    setError('');

    try {
      const room = await chatApi.createRoom({
        title: receiverUserId ? `Private chat ${receiverUserId}` : 'New chat room',
        metadata: receiverUserId ? { receiverUserId } : {},
      });

      currentRoomId = room.id;
      status.innerText = `Room: ${currentRoomId}`;
      await chatApi.heartbeat({ roomId: currentRoomId, isTyping: false });
      await loadMessages();
    } catch (err) {
      setError(err.message || 'Could not create chat room.');
    }
  };

  refreshBtn.onclick = loadMessages;

  heartbeatBtn.onclick = async () => {
    if (!currentRoomId) {
      setError('Create or load a chat room before sending presence.');
      return;
    }
    try {
      await chatApi.heartbeat({ roomId: currentRoomId, isTyping: false });
      await refreshPresence();
    } catch (err) {
      setError(err.message || 'Could not send heartbeat.');
    }
  };

  typingBtn.onclick = async () => {
    if (!currentRoomId) {
      setError('Create or load a chat room before sending typing presence.');
      return;
    }
    try {
      await chatApi.heartbeat({ roomId: currentRoomId, isTyping: true });
      await refreshPresence();
    } catch (err) {
      setError(err.message || 'Could not send typing pulse.');
    }
  };

  markReadBtn.onclick = async () => {
    if (!currentRoomId) {
      setError('Create or load a chat room before marking read.');
      return;
    }
    try {
      await chatApi.markRead({ roomId: currentRoomId, lastReadMessageId: lastMessageId });
      status.innerText = 'Room marked as read.';
      await refreshUnread();
    } catch (err) {
      setError(err.message || 'Could not mark chat as read.');
    }
  };

  unlockBtn.onclick = async () => {
    if (!receiverUserId) return;
    setError('');

    try {
      await chatApi.unlockChat({ targetUserId: receiverUserId, cost: unlockCost, roomId: currentRoomId });
      status.innerText = currentRoomId
        ? `Room: ${currentRoomId} · Chat unlocked`
        : 'Chat unlocked';
    } catch (err) {
      setError(err.message || 'Could not unlock chat.');
    }
  };

  sendBtn.onclick = async () => {
    if (!currentRoomId) {
      setError('Create or load a chat room before sending.');
      return;
    }

    const text = input.value.trim();
    if (!text) return;

    setError('');

    try {
      await chatApi.sendMessage({ roomId: currentRoomId, text, receiverUserId });
      input.value = '';
      await loadMessages();
    } catch (err) {
      setError(err.message || 'Could not send message.');
    }
  };

  input.addEventListener('input', async () => {
    if (!currentRoomId) return;
    if (!input.value.trim()) return;

    try {
      await chatApi.heartbeat({ roomId: currentRoomId, isTyping: true });
      await refreshPresence();
    } catch {
      // Silent typing pulse failure keeps messaging usable.
    }
  });

  shell.appendChild(title);
  shell.appendChild(status);
  shell.appendChild(presenceStatus);
  shell.appendChild(unreadStatus);
  shell.appendChild(controls);
  shell.appendChild(error);
  shell.appendChild(messages);
  shell.appendChild(inputRow);

  if (currentRoomId) {
    chatApi.heartbeat({ roomId: currentRoomId, isTyping: false }).catch(() => {});
    loadMessages();
  }

  return shell;
}
