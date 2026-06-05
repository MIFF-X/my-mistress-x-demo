import { chatStore } from "./chat-store.js";

const ACTION_LABELS = {
  gift: "Digital Gift",
  tip: "Tip Sent",
  voice: "Voice Affirmation",
  file: "Attachment",
  call: "Call Request",
  video: "Video Request"
};

function createTextBubble(msg) {
  const bubble = document.createElement("div");
  bubble.className = `chat-message ${msg.type}`;
  bubble.innerText = msg.text;
  return bubble;
}

function createActionCard(msg) {
  const card = document.createElement("div");
  card.className = `chat-message ${msg.type || "sent"} chat-action-card chat-action-card-${msg.actionKind || "generic"}`;

  const icon = document.createElement("div");
  icon.className = "chat-action-card-icon";
  icon.innerText = msg.icon || "✨";

  const body = document.createElement("div");
  body.className = "chat-action-card-body";

  const title = document.createElement("strong");
  title.innerText = msg.title || ACTION_LABELS[msg.actionKind] || "Chat Action";

  const text = document.createElement("span");
  text.innerText = msg.text;

  body.appendChild(title);
  body.appendChild(text);

  if (msg.credits) {
    const credits = document.createElement("em");
    credits.innerText = `${msg.credits} credits deducted`;
    body.appendChild(credits);
  }

  card.appendChild(icon);
  card.appendChild(body);

  return card;
}

export function renderMessages(messagesContainer, conversationName) {
  messagesContainer.innerHTML = "";

  const messages = chatStore.conversations[conversationName] || [];

  messages.forEach((msg) => {
    const node = msg.actionKind ? createActionCard(msg) : createTextBubble(msg);
    messagesContainer.appendChild(node);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

export function createChatWindow() {
  const windowBox = document.createElement("div");
  windowBox.className = "chat-window";

  const heading = document.createElement("h3");
  heading.className = "chat-window-title";
  heading.innerText = "Select a Conversation";

  const messages = document.createElement("div");
  messages.className = "chat-messages";
  messages.id = "chat-messages";

  const welcome = document.createElement("div");
  welcome.className = "chat-message received";
  welcome.innerText = "Choose a conversation from the left.";

  messages.appendChild(welcome);

  windowBox.appendChild(heading);
  windowBox.appendChild(messages);

  return windowBox;
}
