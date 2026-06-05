const CODE_LOCK_SETTINGS_KEY = "mistressXCodeLockSettings";

function readSettings() {
  try {
    return JSON.parse(localStorage.getItem(CODE_LOCK_SETTINGS_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function writeSettings(nextSettings) {
  localStorage.setItem(CODE_LOCK_SETTINGS_KEY, JSON.stringify(nextSettings));
  window.dispatchEvent(new CustomEvent("mistressx:code-lock-settings-updated", { detail: nextSettings }));
  return nextSettings;
}

export function getCodeLockSettings(targetId) {
  if (!targetId) return null;
  return readSettings()[targetId] || null;
}

export function isCodeLockEnabled(targetId) {
  return Boolean(getCodeLockSettings(targetId)?.enabled);
}

export function saveCodeLockSettings(targetId, settings = {}) {
  if (!targetId) throw new Error("Code lock target id is required.");

  const current = readSettings();
  const next = {
    targetId,
    enabled: Boolean(settings.enabled),
    code: String(settings.code || "").trim(),
    hint: String(settings.hint || "").trim(),
    targetType: settings.targetType || "custom-access-gate",
    paidAttemptsEnabled: Boolean(settings.paidAttemptsEnabled),
    attemptCostCredits: Number(settings.attemptCostCredits || 0),
    attemptLimit: Number(settings.attemptLimit || 0),
    updatedAt: Date.now(),
  };

  return writeSettings({ ...current, [targetId]: next })[targetId];
}

export function disableCodeLock(targetId) {
  const existing = getCodeLockSettings(targetId) || { targetId };
  return saveCodeLockSettings(targetId, { ...existing, enabled: false });
}

export function validateCodeLockAttempt(targetId, attempt) {
  const settings = getCodeLockSettings(targetId);
  if (!settings?.enabled) return { ok: true, reason: "code-lock-disabled", settings };

  const expected = String(settings.code || "").trim().toUpperCase();
  const received = String(attempt || "").trim().toUpperCase();

  if (!expected) return { ok: false, reason: "code-not-configured", settings };
  if (expected === received) return { ok: true, reason: "code-correct", settings };
  return { ok: false, reason: "code-incorrect", settings };
}

export function listCodeLockSettings() {
  return Object.values(readSettings());
}
