export function connectAuctionSocket({ auctionId, onBidUpdate, onEnded, onStatus } = {}) {
  const ioFactory = window.io || window.socketIOClient;
  if (!ioFactory || !auctionId) {
    onStatus?.("Socket client unavailable; local/demo mode active.");
    return { disconnect() {}, join() {}, leave() {} };
  }

  const socket = ioFactory(window.MISTRESS_X_SOCKET_URL || window.location.origin, {
    transports: ["websocket", "polling"],
  });

  const join = () => socket.emit("auction.join", { auctionId });
  const leave = () => socket.emit("auction.leave", { auctionId });

  socket.on("connect", () => {
    onStatus?.("Auction socket connected.");
    join();
  });

  socket.on("auction.bidUpdate", (payload) => {
    if (!payload || payload.auctionId !== auctionId) return;
    onBidUpdate?.(payload);
  });

  socket.on("auction.ended", (payload) => {
    if (!payload || payload.auctionId !== auctionId) return;
    onEnded?.(payload);
  });

  socket.on("disconnect", () => onStatus?.("Auction socket disconnected."));
  socket.on("connect_error", (error) => onStatus?.(`Auction socket error: ${error?.message || error}`));

  return {
    socket,
    join,
    leave,
    disconnect() {
      leave();
      socket.disconnect();
    },
  };
}
