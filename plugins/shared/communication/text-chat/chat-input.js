import {
  DEFAULT_CHAT_MONETISATION_PRICING,
  getChatMonetisationPricing,
  getDigitalGiftOptions,
  getPhoneCallOptions,
  getTipOptions,
  getVideoCallOptions,
  getVoiceAffirmationOptions,
  parsePricingCsv,
  setChatMonetisationPricing
} from "./chat-monetisation-pricing.js";
import { chatStore } from "./chat-store.js";
import { renderMessages } from "./chat-window.js";

const WALLET_STORAGE_KEY = "mistressXDemoWalletBalance";

function pushChatMessage(message) {
  const current = chatStore.currentConversation;
  if (!current) return;

  chatStore.conversations[current].push(message);

  const messages = document.getElementById("chat-messages");
  renderMessages(messages, current);
}

function emitLiveAction(message) {
  window.dispatchEvent(
    new CustomEvent("mistressx:live-action", {
      detail: {
        ...message,
        createdAt: Date.now()
      }
    })
  );
}

function appendActionMessage(text) {
  pushChatMessage({
    type: "sent",
    text
  });
}

function appendRichActionMessage({ actionKind, icon, title, text, credits }) {
  const message = {
    type: "sent",
    actionKind,
    icon,
    title,
    text,
    credits
  };

  pushChatMessage(message);

  if (["gift", "tip", "voice", "call", "video"].includes(actionKind)) {
    emitLiveAction(message);
  }
}

function getWalletBalance() {
  const stored = Number(localStorage.getItem(WALLET_STORAGE_KEY));
  return Number.isFinite(stored) ? stored : 25;
}

function setWalletBalance(value) {
  localStorage.setItem(WALLET_STORAGE_KEY, String(value));
  updateWalletDisplays();
}

function updateWalletDisplays() {
  document.querySelectorAll("[data-wallet-balance]").forEach((node) => {
    node.innerText = `${getWalletBalance()} credits`;
  });
}

function createWalletChip(panel) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "chat-wallet-chip";
  chip.innerHTML = `Wallet: <span data-wallet-balance>${getWalletBalance()} credits</span>`;
  chip.onclick = () => showTopUpPrompt(panel, 25);
  return chip;
}

function chargeWallet(credits) {
  const balance = getWalletBalance();

  if (balance < credits) return false;

  setWalletBalance(balance - credits);
  return true;
}

function createActionButton({ label, title, action, className = "" }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `chat-action-button ${className}`.trim();
  button.innerText = label;
  button.title = title;
  button.setAttribute("aria-label", title);
  button.onclick = action;
  return button;
}

function openFilePicker(fileInput) {
  fileInput.click();
}

function createFileInput() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*,video/*,audio/*,.pdf,.doc,.docx";
  fileInput.className = "chat-hidden-file-input";

  fileInput.onchange = () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    const fileType = file.type.startsWith("image/") ? "photo" : file.type.startsWith("video/") ? "video" : "file";
    appendRichActionMessage({
      actionKind: "file",
      icon: fileType === "photo" ? "📷" : "📎",
      title: fileType === "photo" ? "Photo Attached" : "File Attached",
      text: file.name
    });
    fileInput.value = "";
  };

  return fileInput;
}

function clearPanel(panel) {
  panel.innerHTML = "";
  panel.classList.remove("is-visible");
}

function showPanel(panel, titleText, helperText, options, onSelect) {
  panel.innerHTML = "";
  panel.className = "chat-action-panel is-visible";

  const header = document.createElement("div");
  header.className = "chat-action-panel-header";

  const title = document.createElement("strong");
  title.innerText = titleText;

  const balance = document.createElement("span");
  balance.className = "chat-wallet-balance";
  balance.innerHTML = `Wallet: <span data-wallet-balance>${getWalletBalance()} credits</span>`;

  header.appendChild(title);
  header.appendChild(balance);

  const helper = document.createElement("p");
  helper.className = "chat-action-panel-helper";
  helper.innerText = helperText;

  const optionGrid = document.createElement("div");
  optionGrid.className = "chat-action-option-grid";

  options.forEach((option) => {
    const optionButton = document.createElement("button");
    optionButton.type = "button";
    optionButton.className = option.booking ? "chat-action-option chat-booking-option" : "chat-action-option";
    optionButton.innerHTML = `<strong>${option.label}</strong><span>${option.credits} credits</span>`;
    optionButton.onclick = () => onSelect(option, panel);
    optionGrid.appendChild(optionButton);
  });

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "chat-panel-close";
  closeBtn.innerText = "Close";
  closeBtn.onclick = () => clearPanel(panel);

  panel.appendChild(header);
  panel.appendChild(helper);
  panel.appendChild(optionGrid);
  panel.appendChild(closeBtn);
}

function showTopUpPrompt(panel, requiredCredits) {
  panel.innerHTML = "";
  panel.className = "chat-action-panel is-visible chat-topup-panel";

  const title = document.createElement("strong");
  title.innerText = "Top up wallet";

  const helper = document.createElement("p");
  helper.className = "chat-action-panel-helper";
  helper.innerText = `You need ${requiredCredits} credits, but your wallet only has ${getWalletBalance()} credits.`;

  const row = document.createElement("div");
  row.className = "chat-action-option-grid";

  [25, 50, 100].forEach((amount) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chat-action-option";
    button.innerHTML = `<strong>Top up ${amount}</strong><span>credits</span>`;
    button.onclick = () => {
      setWalletBalance(getWalletBalance() + amount);
      appendRichActionMessage({
        actionKind: "tip",
        icon: "💳",
        title: "Wallet Top-Up",
        text: `Added ${amount} credits to wallet`,
        credits: amount
      });
      clearPanel(panel);
    };
    row.appendChild(button);
  });

  panel.appendChild(title);
  panel.appendChild(helper);
  panel.appendChild(row);
}

function showMistressPricingPanel(panel) {
  const pricing = getChatMonetisationPricing();
  panel.innerHTML = "";
  panel.className = "chat-action-panel is-visible chat-pricing-panel";

  const title = document.createElement("strong");
  title.innerText = "Mistress monetisation settings";

  const helper = document.createElement("p");
  helper.className = "chat-action-panel-helper";
  helper.innerText = "Set the credit values shown to subs for phone, video, bookings, gifts, tips, and voice affirmations.";

  const form = document.createElement("div");
  form.className = "chat-pricing-grid";

  const fields = [
    ["phone", "Phone prices: 5,10,15,30 min", pricing.phone.join(",")],
    ["video", "Video prices: 5,10,20,30 min", pricing.video.join(",")],
    ["phoneBooking", "Phone booking after live", pricing.phoneBooking],
    ["videoBooking", "Video booking after live", pricing.videoBooking],
    ["gifts", "Gift prices", pricing.gifts.join(",")],
    ["tips", "Tip prices", pricing.tips.join(",")],
    ["voice", "Voice prices: 5,10,15,30,60 sec", pricing.voice.join(",")]
  ];

  fields.forEach(([key, label, value]) => {
    const field = document.createElement("label");
    field.className = "chat-pricing-field";
    field.innerHTML = `<span>${label}</span>`;
    const input = document.createElement("input");
    input.value = value;
    input.dataset.pricingKey = key;
    field.appendChild(input);
    form.appendChild(field);
  });

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "chat-pricing-save";
  saveBtn.innerText = "Save pricing";
  saveBtn.onclick = () => {
    const nextPricing = { ...pricing };
    form.querySelectorAll("input[data-pricing-key]").forEach((input) => {
      const key = input.dataset.pricingKey;
      if (["phoneBooking", "videoBooking"].includes(key)) {
        nextPricing[key] = Number(input.value) || DEFAULT_CHAT_MONETISATION_PRICING[key];
      } else {
        nextPricing[key] = parsePricingCsv(input.value, DEFAULT_CHAT_MONETISATION_PRICING[key]);
      }
    });
    setChatMonetisationPricing(nextPricing);
    appendRichActionMessage({
      actionKind: "tip",
      icon: "⚙️",
      title: "Pricing Updated",
      text: "Mistress chat monetisation values saved"
    });
    clearPanel(panel);
  };

  panel.appendChild(title);
  panel.appendChild(helper);
  panel.appendChild(form);
  panel.appendChild(saveBtn);
}

function payForChatAction(panel, option, successPayload) {
  if (!chargeWallet(option.credits)) {
    showTopUpPrompt(panel, option.credits);
    return;
  }

  appendRichActionMessage(successPayload(option));
  clearPanel(panel);
}

export function createChatInput(options = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "chat-composer-shell";

  const fileInput = createFileInput();
  const isAlreadyMessaging = options.isAlreadyMessaging ?? true;
  const role = options.role || window.currentRole || "sub";
  const isMistressSide = role === "mistress" || role === "MISTRESS" || role === "headmistress" || role === "HEADMISTRESS";
  const panel = document.createElement("div");
  panel.className = "chat-action-panel";

  const metaRow = document.createElement("div");
  metaRow.className = "chat-composer-meta-row";
  metaRow.appendChild(createWalletChip(panel));

  if (isMistressSide) {
    metaRow.appendChild(
      createActionButton({
        label: "⚙️ Pricing",
        title: "Set monetisation values",
        className: "chat-pricing-button",
        action: () => showMistressPricingPanel(panel)
      })
    );
  }

  const wrapperRow = document.createElement("div");
  wrapperRow.className = "chat-input-wrapper";

  if (!isAlreadyMessaging) {
    wrapperRow.appendChild(
      createActionButton({
        label: "💬",
        title: "Message",
        className: "chat-message-action",
        action: () => appendActionMessage("Message request opened")
      })
    );
  }

  const plusButton = createActionButton({
    label: "+",
    title: "Upload photo or file",
    className: "chat-plus-button",
    action: () => openFilePicker(fileInput)
  });

  const phoneButton = createActionButton({
    label: "📞",
    title: "Phone call",
    className: "chat-phone-button",
    action: () =>
      showPanel(
        panel,
        "Phone call",
        "Choose a paid phone call length or book a phone chat after the live session.",
        getPhoneCallOptions(),
        (option) =>
          payForChatAction(panel, option, (call) => ({
            actionKind: "call",
            icon: call.booking ? "📅" : "📞",
            title: call.booking ? "Phone Booking Requested" : "Phone Call Requested",
            text: call.booking ? `${call.minutes} minute phone booking after live` : `${call.minutes} minute phone call`,
            credits: call.credits
          }))
      )
  });

  const videoButton = createActionButton({
    label: "🎥",
    title: "Video call",
    className: "chat-video-button",
    action: () =>
      showPanel(
        panel,
        "Video call",
        "Choose a paid video call length or book a video chat after the live session.",
        getVideoCallOptions(),
        (option) =>
          payForChatAction(panel, option, (video) => ({
            actionKind: "video",
            icon: video.booking ? "📅" : "🎥",
            title: video.booking ? "Video Booking Requested" : "Video Call Requested",
            text: video.booking ? `${video.minutes} minute video booking after live` : `${video.minutes} minute video call`,
            credits: video.credits
          }))
      )
  });

  const giftButton = createActionButton({
    label: "🎁",
    title: "Digital gifts",
    className: "chat-gift-button",
    action: () =>
      showPanel(
        panel,
        "Digital gifts",
        "Pick a gift. Credits deduct from the sub wallet and the gift posts into chat.",
        getDigitalGiftOptions(),
        (option) =>
          payForChatAction(panel, option, (gift) => ({
            actionKind: "gift",
            icon: gift.label.split(" ")[0] || "🎁",
            title: "Digital Gift Sent",
            text: gift.label,
            credits: gift.credits
          }))
      )
  });

  const tipButton = createActionButton({
    label: "💸",
    title: "Tip",
    className: "chat-tip-button",
    action: () =>
      showPanel(
        panel,
        "Send a tip",
        "Choose a tip amount. If the wallet is empty, the sub is prompted to top up first.",
        getTipOptions(),
        (option) =>
          payForChatAction(panel, option, (tip) => ({
            actionKind: "tip",
            icon: "💸",
            title: "Tip Sent",
            text: tip.label,
            credits: tip.credits
          }))
      )
  });

  const voiceButton = createActionButton({
    label: "🎙️",
    title: "Paid voice affirmation",
    className: "chat-voice-button",
    action: () =>
      showPanel(
        panel,
        "Paid voice affirmation",
        "Choose 5, 10, 15, 30, or 60 seconds. Payment is checked before recording starts.",
        getVoiceAffirmationOptions().map((option) => ({ ...option, label: `${option.seconds} seconds` })),
        (option) =>
          payForChatAction(panel, option, (voice) => ({
            actionKind: "voice",
            icon: "🎙️",
            title: "Voice Affirmation Ready",
            text: `${voice.seconds} second paid voice affirmation`,
            credits: voice.credits
          }))
      )
  });

  const input = document.createElement("input");
  input.placeholder = "Message, request, tip note...";
  input.className = "chat-input";

  const sendButton = document.createElement("button");
  sendButton.innerText = "➤";
  sendButton.className = "button-primary chat-send-button";
  sendButton.title = "Send";
  sendButton.setAttribute("aria-label", "Send message");

  sendButton.onclick = () => {
    const current = chatStore.currentConversation;
    if (!current) return;
    const value = input.value.trim();
    if (!value) return;
    chatStore.conversations[current].push({ type: "sent", text: value });
    const messages = document.getElementById("chat-messages");
    renderMessages(messages, current);
    input.value = "";
  };

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") sendButton.click();
  });

  wrapperRow.appendChild(plusButton);
  wrapperRow.appendChild(phoneButton);
  wrapperRow.appendChild(videoButton);
  wrapperRow.appendChild(giftButton);
  wrapperRow.appendChild(tipButton);
  wrapperRow.appendChild(voiceButton);
  wrapperRow.appendChild(input);
  wrapperRow.appendChild(sendButton);

  wrapper.appendChild(fileInput);
  wrapper.appendChild(metaRow);
  wrapper.appendChild(wrapperRow);
  wrapper.appendChild(panel);

  updateWalletDisplays();

  return wrapper;
}
