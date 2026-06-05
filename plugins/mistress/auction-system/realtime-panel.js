import { connectAuctionSocket } from "./socket-bridge.js";
import { applyAuctionBidUpdate, applyAuctionEndedUpdate } from "./realtime-state.js";

function make(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.innerText = text;
  return node;
}

function notifyStateApplied(kind, payload, applied) {
  window.dispatchEvent(new CustomEvent("mistressx:auction-realtime-state-applied", {
    detail: { kind, payload, applied },
  }));
}

export function createAuctionRealtimePanel() {
  const panel = make("section", "mx-auction-panel");
  panel.innerHTML = `
    <div class="mx-auction-panel-heading">
      <div><small>Realtime Monitor</small><h3>Live auction socket bridge</h3></div>
      <span>auction.join · auction.bidUpdate · auction.ended</span>
    </div>
    <p class="mx-auction-description">Connect by backend auction ID, or press Live Sync on any API-backed auction card.</p>
    <div class="mx-auction-stage-select-row"></div>
    <div class="mx-auction-history"></div>
  `;

  const row = panel.querySelector(".mx-auction-stage-select-row");
  const log = panel.querySelector(".mx-auction-history");
  let connection = null;

  const input = document.createElement("input");
  input.placeholder = "Backend auction ID";

  const connectToAuction = (auctionId, title = "Auction") => {
    const id = String(auctionId || "").trim();
    if (!id) {
      log.innerHTML = "<strong>Realtime</strong><span>Enter a backend auction ID first.</span>";
      return;
    }
    input.value = id;
    connection?.disconnect?.();
    log.innerHTML = `<strong>Realtime</strong><span>Connecting to ${title}...</span>`;
    connection = connectAuctionSocket({
      auctionId: id,
      onStatus(message) {
        log.innerHTML = `<strong>Realtime</strong><span>${message}</span>`;
      },
      onBidUpdate(payload) {
        const applied = applyAuctionBidUpdate(payload);
        notifyStateApplied("bidUpdate", payload, applied);
        log.innerHTML = `<strong>Bid Update</strong><span>${payload.bidderId || "Bidder"}: ${payload.amount || payload.currentBid} credits${applied ? " · UI updated" : " · no matching local lot"}</span>`;
      },
      onEnded(payload) {
        const applied = applyAuctionEndedUpdate(payload);
        notifyStateApplied("ended", payload, applied);
        log.innerHTML = `<strong>Auction Ended</strong><span>${payload.reason || "closed"} · ${payload.currentBid || 0} credits${applied ? " · UI updated" : " · no matching local lot"}</span>`;
      },
    });
  };

  const connectBtn = make("button", "mx-auction-btn primary", "Connect");
  connectBtn.onclick = () => connectToAuction(input.value.trim());

  const disconnectBtn = make("button", "mx-auction-btn", "Disconnect");
  disconnectBtn.onclick = () => {
    connection?.disconnect?.();
    connection = null;
    log.innerHTML = "<strong>Realtime</strong><span>Disconnected.</span>";
  };

  const cardSyncHandler = (event) => {
    const detail = event.detail || {};
    connectToAuction(detail.auctionId, detail.title || "Auction card");
  };
  window.addEventListener("mistressx:auction-realtime-connect", cardSyncHandler);
  panel.cleanup = () => {
    window.removeEventListener("mistressx:auction-realtime-connect", cardSyncHandler);
    connection?.disconnect?.();
  };

  row.appendChild(input);
  row.appendChild(connectBtn);
  row.appendChild(disconnectBtn);
  log.innerHTML = "<strong>Realtime</strong><span>Socket monitor ready. Use a card's Live Sync button or enter an auction ID.</span>";
  return panel;
}
