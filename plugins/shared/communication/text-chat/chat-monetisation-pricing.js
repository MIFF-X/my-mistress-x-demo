export const PRICING_STORAGE_KEY = "mistressXChatMonetisationPricing";

export const DEFAULT_CHAT_MONETISATION_PRICING = {
  phone: [12, 20, 28, 50],
  video: [20, 35, 65, 90],
  phoneBooking: 18,
  videoBooking: 30,
  gifts: [5, 15, 30, 50],
  tips: [5, 10, 25, 50],
  voice: [5, 9, 12, 22, 40]
};

export function getChatMonetisationPricing() {
  try {
    return {
      ...DEFAULT_CHAT_MONETISATION_PRICING,
      ...(JSON.parse(localStorage.getItem(PRICING_STORAGE_KEY) || "{}") || {})
    };
  } catch {
    return DEFAULT_CHAT_MONETISATION_PRICING;
  }
}

export function setChatMonetisationPricing(nextPricing) {
  localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(nextPricing));
}

export function parsePricingCsv(value, fallback) {
  const parsed = value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item >= 0);

  return parsed.length > 0 ? parsed : fallback;
}

export function getPhoneCallOptions() {
  const pricing = getChatMonetisationPricing();
  return [
    { label: "5 min phone", minutes: 5, credits: pricing.phone?.[0] ?? 12 },
    { label: "10 min phone", minutes: 10, credits: pricing.phone?.[1] ?? 20 },
    { label: "15 min phone", minutes: 15, credits: pricing.phone?.[2] ?? 28 },
    { label: "30 min phone", minutes: 30, credits: pricing.phone?.[3] ?? 50 },
    { label: "Book phone after live", minutes: 15, credits: pricing.phoneBooking ?? 18, booking: true }
  ];
}

export function getVideoCallOptions() {
  const pricing = getChatMonetisationPricing();
  return [
    { label: "5 min video", minutes: 5, credits: pricing.video?.[0] ?? 20 },
    { label: "10 min video", minutes: 10, credits: pricing.video?.[1] ?? 35 },
    { label: "20 min video", minutes: 20, credits: pricing.video?.[2] ?? 65 },
    { label: "30 min video", minutes: 30, credits: pricing.video?.[3] ?? 90 },
    { label: "Book video after live", minutes: 20, credits: pricing.videoBooking ?? 30, booking: true }
  ];
}

export function getDigitalGiftOptions() {
  const pricing = getChatMonetisationPricing();
  return [
    { label: "🌹 Rose", credits: pricing.gifts?.[0] ?? 5 },
    { label: "👑 Crown", credits: pricing.gifts?.[1] ?? 15 },
    { label: "💎 Diamond", credits: pricing.gifts?.[2] ?? 30 },
    { label: "🔥 Fire", credits: pricing.gifts?.[3] ?? 50 }
  ];
}

export function getTipOptions() {
  const pricing = getChatMonetisationPricing();
  return [
    { label: "Quick tip", credits: pricing.tips?.[0] ?? 5 },
    { label: "Good girl tribute", credits: pricing.tips?.[1] ?? 10 },
    { label: "Priority attention", credits: pricing.tips?.[2] ?? 25 },
    { label: "Custom", credits: pricing.tips?.[3] ?? 50 }
  ];
}

export function getVoiceAffirmationOptions() {
  const pricing = getChatMonetisationPricing();
  return [
    { seconds: 5, credits: pricing.voice?.[0] ?? 5 },
    { seconds: 10, credits: pricing.voice?.[1] ?? 9 },
    { seconds: 15, credits: pricing.voice?.[2] ?? 12 },
    { seconds: 30, credits: pricing.voice?.[3] ?? 22 },
    { seconds: 60, credits: pricing.voice?.[4] ?? 40 }
  ];
}
