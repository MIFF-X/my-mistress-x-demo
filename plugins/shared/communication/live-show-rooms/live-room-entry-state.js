const LIVE_ROOM_ENTRY_KEY = "mistressXLiveRoomEntryState";

function readState() {
  try {
    return JSON.parse(localStorage.getItem(LIVE_ROOM_ENTRY_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function writeState(nextState) {
  localStorage.setItem(LIVE_ROOM_ENTRY_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new CustomEvent("mistressx:live-room-entry-updated", { detail: nextState }));
  return nextState;
}

export function getRoomEntry(roomId) {
  return readState()[roomId] || null;
}

export function canEnterRoom(room) {
  if (!room) return false;
  if (room.accessType === "public") return true;
  return Boolean(getRoomEntry(room.id)?.enteredAt);
}

export function markRoomEntered(room, reason = "local-demo") {
  if (!room?.id) return null;
  const nextEntry = {
    roomId: room.id,
    roomType: room.accessType || "public",
    hostUserId: room.hostUserId || null,
    reason,
    enteredAt: Date.now(),
  };

  writeState({ ...readState(), [room.id]: nextEntry });
  return nextEntry;
}

export function clearRoomEntry(roomId) {
  const next = { ...readState() };
  delete next[roomId];
  writeState(next);
  return next;
}

export function checkRoomCode(room, code) {
  if (!room?.accessCode) return false;
  return String(code || "").trim().toUpperCase() === String(room.accessCode).trim().toUpperCase();
}

export function getRoomEntryLabel(room) {
  if (!room) return "Unknown room";
  if (room.accessType === "public") return "Open room";
  if (canEnterRoom(room)) return "Ready to enter";
  if (room.accessType === "code") return "Code needed";
  return "Entry needed";
}
