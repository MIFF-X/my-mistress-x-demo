function parseSlotDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function padDatePart(value) {
  return String(value).padStart(2, "0");
}

export function formatAfterLiveApprovedSlot(bookingOrValue) {
  const value = typeof bookingOrValue === "object" && bookingOrValue !== null
    ? bookingOrValue.approvedSlot || bookingOrValue.scheduledAt || bookingOrValue.approvedSlotIso
    : bookingOrValue;
  if (!value) return "";

  const date = parseSlotDate(value);
  if (date && (String(value).includes("T") || String(value).includes("-"))) return date.toLocaleString();
  return String(value);
}

export function toAfterLiveDatetimeLocalValue(value) {
  const date = parseSlotDate(value);
  if (!date) return "";

  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-") + `T${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
}

export function resolveAfterLiveApprovedSlotInput({ label = "", datetimeLocal = "", fallback = "To be confirmed" } = {}) {
  const cleanLabel = String(label || "").trim();
  const date = parseSlotDate(datetimeLocal);
  const scheduledAt = date ? date.toISOString() : null;
  const approvedSlot = cleanLabel || (date ? date.toLocaleString() : fallback);

  return {
    approvedSlot,
    scheduledAt,
  };
}
