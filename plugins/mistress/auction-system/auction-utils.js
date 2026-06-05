import { LOT_TYPES } from "./auction-store.js";

export function getLotTypeMeta(type) {
  return LOT_TYPES.find((item) => item.id === type) || LOT_TYPES[0];
}

export function formatCredits(value) {
  return `${Number(value || 0).toLocaleString()} credits`;
}

export function formatTimer(seconds = 0) {
  const safe = Math.max(0, Number(seconds) || 0);
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function createAuctionId(prefix = "auction") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function dispatchAuctionLiveAction(detail) {
  window.dispatchEvent(new CustomEvent("mistressx:live-action", { detail }));
}

export function getAuctionAddonLabel(addon) {
  return `${addon.icon || "🔨"} ${addon.label}`;
}
