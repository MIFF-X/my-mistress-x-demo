import {
  getLiveShowOfferSettings,
  saveLiveShowOfferSettings,
} from "./live-show-offer-settings-store.js";

function createInput(labelText, value, type = "text", placeholder = "") {
  const label = document.createElement("label");
  label.className = "live-offer-settings-field";

  const span = document.createElement("span");
  span.innerText = labelText;

  const input = document.createElement("input");
  input.type = type;
  input.value = Array.isArray(value) ? value.join(",") : String(value ?? "");
  input.placeholder = placeholder;

  label.appendChild(span);
  label.appendChild(input);
  return { label, input };
}

function createSelect(labelText, value) {
  const label = document.createElement("label");
  label.className = "live-offer-settings-field";

  const span = document.createElement("span");
  span.innerText = labelText;

  const select = document.createElement("select");
  [
    ["custom", "Custom Link"],
    ["amazon", "Amazon Wishlist"],
    ["deliverycode", "Delivery Code"],
    ["other", "Other 3rd Party Wishlist"],
  ].forEach(([optionValue, optionLabel]) => {
    const option = document.createElement("option");
    option.value = optionValue;
    option.innerText = optionLabel;
    option.selected = optionValue === value;
    select.appendChild(option);
  });

  label.appendChild(span);
  label.appendChild(select);
  return { label, select };
}

function createToggle(labelText, checked) {
  const label = document.createElement("label");
  label.className = "live-offer-settings-toggle";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = Boolean(checked);

  const span = document.createElement("span");
  span.innerText = labelText;

  label.appendChild(input);
  label.appendChild(span);
  return { label, input };
}

export function createLiveShowOfferSettingsPanel({ mistressId = "demo-mistress", title = "Live Show Offer Settings" } = {}) {
  ensureLiveShowOfferSettingsPanelStyles();
  const settings = getLiveShowOfferSettings(mistressId);

  const panel = document.createElement("div");
  panel.className = "panel live-show-offer-settings-panel";

  const heading = document.createElement("h3");
  heading.innerText = title;

  const intro = document.createElement("p");
  intro.innerText = "Choose the clickable offers that appear during Live Shows and Watch With Mistress. Subs can collapse or expand these options while the show is running.";

  const wishlistToggle = createToggle("Show wishlist button during shows", settings.wishlistEnabled);
  const phoneToggle = createToggle("Offer phone call booking batches", settings.phoneBookingEnabled);
  const videoToggle = createToggle("Offer 1-on-1 video call booking batches", settings.videoBookingEnabled);

  const wishlistTitle = createInput("Wishlist title", settings.wishlistTitle, "text", "Mistress Wishlist");
  const wishlistUrl = createInput("Wishlist URL", settings.wishlistUrl, "url", "https://...");
  const wishlistProvider = createSelect("Wishlist provider", settings.wishlistProvider);
  const deliveryCode = createInput("Delivery code / instructions", settings.deliveryCode, "text", "Optional delivery code or safe delivery note");
  const voiceRate = createInput("Voice / phone rate per minute", settings.voiceCallRate, "number", "20");
  const videoRate = createInput("Video rate per minute", settings.videoCallRate, "number", "35");
  const phoneMinutes = createInput("Phone batch durations", settings.phoneBookingMinutes, "text", "5,10,15,30");
  const videoMinutes = createInput("Video batch durations", settings.videoBookingMinutes, "text", "5,10,20,30");
  const notes = createInput("Show offer notes", settings.notes, "text", "Optional sub-facing offer copy");

  const grid = document.createElement("div");
  grid.className = "live-offer-settings-grid";
  [
    wishlistToggle.label,
    phoneToggle.label,
    videoToggle.label,
    wishlistTitle.label,
    wishlistUrl.label,
    wishlistProvider.label,
    deliveryCode.label,
    voiceRate.label,
    videoRate.label,
    phoneMinutes.label,
    videoMinutes.label,
    notes.label,
  ].forEach((item) => grid.appendChild(item));

  const status = document.createElement("p");
  status.className = "live-offer-settings-status";
  status.innerText = "Ready to save live show offer settings.";

  const saveButton = document.createElement("button");
  saveButton.className = "button-primary";
  saveButton.innerText = "Save Live Show Offers";
  saveButton.onclick = () => {
    const saved = saveLiveShowOfferSettings(mistressId, {
      wishlistEnabled: wishlistToggle.input.checked,
      phoneBookingEnabled: phoneToggle.input.checked,
      videoBookingEnabled: videoToggle.input.checked,
      wishlistTitle: wishlistTitle.input.value,
      wishlistUrl: wishlistUrl.input.value,
      wishlistProvider: wishlistProvider.select.value,
      deliveryCode: deliveryCode.input.value,
      voiceCallRate: voiceRate.input.value,
      videoCallRate: videoRate.input.value,
      phoneBookingMinutes: phoneMinutes.input.value,
      videoBookingMinutes: videoMinutes.input.value,
      notes: notes.input.value,
    });

    status.innerText = `Saved. Wishlist ${saved.wishlistEnabled ? "on" : "off"}, phone ${saved.phoneBookingEnabled ? "on" : "off"}, video ${saved.videoBookingEnabled ? "on" : "off"}.`;
  };

  panel.appendChild(heading);
  panel.appendChild(intro);
  panel.appendChild(grid);
  panel.appendChild(saveButton);
  panel.appendChild(status);
  return panel;
}

export function ensureLiveShowOfferSettingsPanelStyles() {
  if (document.getElementById("live-show-offer-settings-panel-styles")) return;

  const style = document.createElement("style");
  style.id = "live-show-offer-settings-panel-styles";
  style.textContent = `
    .live-show-offer-settings-panel p,
    .live-offer-settings-status {
      color: rgba(255,255,255,0.72);
      font-size: 13px;
    }

    .live-offer-settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px;
      margin: 12px 0;
    }

    .live-offer-settings-field,
    .live-offer-settings-toggle {
      display: flex;
      flex-direction: column;
      gap: 6px;
      color: rgba(255,255,255,0.72);
      font-size: 12px;
      font-weight: 800;
    }

    .live-offer-settings-toggle {
      flex-direction: row;
      align-items: center;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 10px;
    }

    .live-offer-settings-field input,
    .live-offer-settings-field select {
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      background: #101016;
      color: white;
      padding: 10px;
    }
  `;
  document.head.appendChild(style);
}
