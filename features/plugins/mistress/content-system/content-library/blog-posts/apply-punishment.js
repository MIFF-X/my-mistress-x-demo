import { punishmentStore } from "./punishment-store.js";

export function applyPunishment(user, preset) {
  punishmentStore.active.push({
    id: `${user.id}-${preset.id}-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    presetId: preset.id,
    presetName: preset.name,
    duration: preset.duration,
    severity: preset.severity
  });

  punishmentStore.history.push({
    type: "applied",
    userId: user.id,
    userName: user.name,
    presetId: preset.id,
    presetName: preset.name,
    duration: preset.duration,
    severity: preset.severity,
    timestamp: new Date().toLocaleString()
  });
}

export function removePunishment(activeId) {
  const found = punishmentStore.active.find((item) => item.id === activeId);
  if (!found) return;

  punishmentStore.active = punishmentStore.active.filter((item) => item.id !== activeId);

  punishmentStore.history.push({
    type: "removed",
    userId: found.userId,
    userName: found.userName,
    presetId: found.presetId,
    presetName: found.presetName,
    duration: found.duration,
    severity: found.severity,
    timestamp: new Date().toLocaleString()
  });
}

export function clearAllPunishmentsForUser(userId) {
  const matches = punishmentStore.active.filter((item) => item.userId === userId);

  matches.forEach((item) => {
    punishmentStore.history.push({
      type: "removed",
      userId: item.userId,
      userName: item.userName,
      presetId: item.presetId,
      presetName: item.presetName,
      duration: item.duration,
      severity: item.severity,
      timestamp: new Date().toLocaleString()
    });
  });

  punishmentStore.active = punishmentStore.active.filter((item) => item.userId !== userId);
}
