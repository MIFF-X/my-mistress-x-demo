const LIVE_SHOW_OFFER_SETTINGS_KEY = "mistressXLiveShowOfferSettings";

const DEFAULT_SETTINGS = {
  wishlistEnabled: true,
  phoneBookingEnabled: true,
  videoBookingEnabled: true,
  voiceCallRate: 20,
  videoCallRate: 35,
  phoneBookingMinutes: [5, 10, 15, 30],
  videoBookingMinutes: [5, 10, 20, 30],
  wishlistTitle: "Mistress Wishlist",
  wishlistUrl: "",
  wishlistProvider: "custom",
  deliveryCode: "",
  notes: "",
};

function readAllSettings() {
  try {
    return JSON.parse(localStorage.getItem(LIVE_SHOW_OFFER_SETTINGS_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function writeAllSettings(next) {
  localStorage.setItem(LIVE_SHOW_OFFER_SETTINGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("mistressx:live-show-offer-settings-updated", { detail: next }));
  return next;
}

function normalizeMinutes(value, fallback) {
  if (Array.isArray(value)) return value.map(Number).filter((item) => Number.isFinite(item) && item > 0);
  return String(value || "")
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0) || fallback;
}

export function getLiveShowOfferSettings(mistressId = "demo-mistress") {
  const stored = readAllSettings()[mistressId] || {};
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    voiceCallRate: Number(stored.voiceCallRate ?? DEFAULT_SETTINGS.voiceCallRate),
    videoCallRate: Number(stored.videoCallRate ?? DEFAULT_SETTINGS.videoCallRate),
    phoneBookingMinutes: normalizeMinutes(stored.phoneBookingMinutes, DEFAULT_SETTINGS.phoneBookingMinutes),
    videoBookingMinutes: normalizeMinutes(stored.videoBookingMinutes, DEFAULT_SETTINGS.videoBookingMinutes),
  };
}

export function saveLiveShowOfferSettings(mistressId = "demo-mistress", settings = {}) {
  const nextSettings = {
    ...getLiveShowOfferSettings(mistressId),
    ...settings,
    wishlistEnabled: Boolean(settings.wishlistEnabled),
    phoneBookingEnabled: Boolean(settings.phoneBookingEnabled),
    videoBookingEnabled: Boolean(settings.videoBookingEnabled),
    voiceCallRate: Number(settings.voiceCallRate || DEFAULT_SETTINGS.voiceCallRate),
    videoCallRate: Number(settings.videoCallRate || DEFAULT_SETTINGS.videoCallRate),
    phoneBookingMinutes: normalizeMinutes(settings.phoneBookingMinutes, DEFAULT_SETTINGS.phoneBookingMinutes),
    videoBookingMinutes: normalizeMinutes(settings.videoBookingMinutes, DEFAULT_SETTINGS.videoBookingMinutes),
    updatedAt: Date.now(),
  };

  const all = readAllSettings();
  writeAllSettings({ ...all, [mistressId]: nextSettings });
  return nextSettings;
}

export function getWishlistLinkLabel(settings = getLiveShowOfferSettings()) {
  const provider = String(settings.wishlistProvider || "custom").toLowerCase();
  if (provider === "amazon") return "Open Amazon Wishlist";
  if (provider === "deliverycode") return "Open Delivery Code Wishlist";
  return settings.wishlistTitle || "Open Wishlist";
}
