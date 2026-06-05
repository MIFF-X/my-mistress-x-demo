import { createCodeLockSettingsPanel } from "../../plugins/shared/code-lock/code-lock-settings-panel.js";
import {
  DEFAULT_CHAT_MONETISATION_PRICING,
  getChatMonetisationPricing,
  parsePricingCsv,
  setChatMonetisationPricing
} from "../../plugins/shared/communication/text-chat/chat-monetisation-pricing.js";
import { createLiveShowOfferSettingsPanel } from "../../plugins/shared/communication/live-show-rooms/live-show-offer-settings-panel.js";

function createField({ key, label, value, helper }) {
  const field = document.createElement("label");
  field.className = "panel monetisation-field";

  const title = document.createElement("strong");
  title.innerText = label;

  const input = document.createElement("input");
  input.value = Array.isArray(value) ? value.join(",") : value;
  input.dataset.pricingKey = key;

  const hint = document.createElement("small");
  hint.innerText = helper;

  field.appendChild(title);
  field.appendChild(input);
  field.appendChild(hint);

  return field;
}

function createSummary(pricing) {
  const summary = document.createElement("div");
  summary.className = "panel";
  summary.innerHTML = `
    <h3>Current Chat Monetisation</h3>
    <p><strong>Phone:</strong> ${pricing.phone.join(" / ")} credits</p>
    <p><strong>Video:</strong> ${pricing.video.join(" / ")} credits</p>
    <p><strong>After-live booking:</strong> Phone ${pricing.phoneBooking} credits · Video ${pricing.videoBooking} credits</p>
    <p><strong>Gifts:</strong> ${pricing.gifts.join(" / ")} credits</p>
    <p><strong>Tips:</strong> ${pricing.tips.join(" / ")} credits</p>
    <p><strong>Voice:</strong> ${pricing.voice.join(" / ")} credits</p>
  `;
  return summary;
}

function createLiveShowOffersSection() {
  const section = document.createElement("div");
  section.className = "mistress-live-offer-settings-section";

  const heading = document.createElement("h2");
  heading.innerText = "🎥 Live Show + Watch With Mistress Offers";

  const intro = document.createElement("p");
  intro.innerText = "Configure the clickable tray shown during live shows and Watch With Mistress: wishlist, private messages, phone call batches, 1-on-1 video booking batches, rates, durations, and delivery-code wishlist links.";

  section.appendChild(heading);
  section.appendChild(intro);
  section.appendChild(
    createLiveShowOfferSettingsPanel({
      mistressId: "demo-mistress",
      title: "Show Offer Tray Settings"
    })
  );

  return section;
}

function createCodeLockSection() {
  const section = document.createElement("div");
  section.className = "mistress-code-lock-settings-section";

  const heading = document.createElement("h2");
  heading.innerText = "🔐 Code Lock Access Gates";

  const intro = document.createElement("p");
  intro.innerText = "Optional Mistress-controlled access code settings. Turn it on, set a code, add a hint, choose what it locks, and optionally charge credits per attempt.";

  const demoTargets = document.createElement("div");
  demoTargets.className = "monetisation-settings-grid";
  demoTargets.appendChild(
    createCodeLockSettingsPanel({
      targetId: "mistress-room-access-demo",
      targetType: "room",
      title: "Room Code Lock"
    })
  );
  demoTargets.appendChild(
    createCodeLockSettingsPanel({
      targetId: "mistress-content-box-demo",
      targetType: "content",
      title: "Content / Box Code Lock"
    })
  );
  demoTargets.appendChild(
    createCodeLockSettingsPanel({
      targetId: "mistress-game-code-demo",
      targetType: "game",
      title: "Game Code Lock"
    })
  );

  section.appendChild(heading);
  section.appendChild(intro);
  section.appendChild(demoTargets);
  return section;
}

export function createMistressMonetisationSettings() {
  const pricing = getChatMonetisationPricing();
  const shell = document.createElement("div");
  shell.className = "page-shell mistress-monetisation-settings";
  shell.style.padding = "20px";

  const title = document.createElement("h2");
  title.innerText = "⚙️ Mistress Monetisation Settings";

  const intro = document.createElement("p");
  intro.innerText = "Set the credit prices shown to subs in chat, live overlays, bookings, tips, digital gifts, and paid voice affirmations.";

  const form = document.createElement("div");
  form.className = "monetisation-settings-grid";

  const fields = [
    { key: "phone", label: "Phone call prices", value: pricing.phone, helper: "CSV for 5, 10, 15, 30 minute phone calls." },
    { key: "video", label: "Video call prices", value: pricing.video, helper: "CSV for 5, 10, 20, 30 minute video calls." },
    { key: "phoneBooking", label: "Phone booking after live", value: pricing.phoneBooking, helper: "Single credit value for after-live phone chat booking." },
    { key: "videoBooking", label: "Video booking after live", value: pricing.videoBooking, helper: "Single credit value for after-live video chat booking." },
    { key: "gifts", label: "Digital gift prices", value: pricing.gifts, helper: "CSV for rose, crown, diamond, fire gifts." },
    { key: "tips", label: "Tip prices", value: pricing.tips, helper: "CSV for quick, standard, priority, custom tip buttons." },
    { key: "voice", label: "Voice affirmation prices", value: pricing.voice, helper: "CSV for 5, 10, 15, 30, 60 second paid voice affirmations." }
  ];

  fields.forEach((field) => form.appendChild(createField(field)));

  const status = document.createElement("p");
  status.className = "monetisation-save-status";

  const resetBtn = document.createElement("button");
  resetBtn.className = "button-secondary";
  resetBtn.innerText = "Reset Defaults";
  resetBtn.onclick = () => {
    setChatMonetisationPricing(DEFAULT_CHAT_MONETISATION_PRICING);
    status.innerText = "Default chat monetisation prices restored.";
  };

  const saveBtn = document.createElement("button");
  saveBtn.className = "button-primary";
  saveBtn.innerText = "Save Monetisation Settings";
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
    status.innerText = "Saved. Chat and live-session panels now use the updated prices.";
  };

  const actions = document.createElement("div");
  actions.className = "button-row";
  actions.appendChild(saveBtn);
  actions.appendChild(resetBtn);

  shell.appendChild(title);
  shell.appendChild(intro);
  shell.appendChild(createSummary(pricing));
  shell.appendChild(form);
  shell.appendChild(actions);
  shell.appendChild(status);
  shell.appendChild(createLiveShowOffersSection());
  shell.appendChild(createCodeLockSection());

  return shell;
}
