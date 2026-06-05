export function installAuctionRealtimeSync({ onConnect } = {}) {
  const handler = (event) => {
    const detail = event.detail || {};
    onConnect?.(detail);
  };
  window.addEventListener("mistressx:auction-realtime-connect", handler);
  return {
    disconnect() {
      window.removeEventListener("mistressx:auction-realtime-connect", handler);
    },
  };
}
