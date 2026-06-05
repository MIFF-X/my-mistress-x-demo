import { createAuctionCommerceToolTray } from "../../plugins/mistress/auction-system/auction-ui.js";

export function createLiveCommerceWrapper(page, { stageId = "live-stage-zone", hostMode = false } = {}) {
  const stage = page.querySelector("#live-video-stage");
  if (!stage || stage.querySelector("#live-commerce-tray-slot")) return page;

  const slot = document.createElement("div");
  slot.id = "live-commerce-tray-slot";
  slot.appendChild(createAuctionCommerceToolTray({
    stageId,
    defaultExpanded: hostMode,
    showOpenButton: hostMode
  }));
  stage.appendChild(slot);
  return page;
}
