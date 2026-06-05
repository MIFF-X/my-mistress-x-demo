import { createLiveShowChatSidebar } from './live-show-chat-sidebar.js';

export function createLiveShow({ viewerCount = 142 } = {}) {
  const page = document.createElement('div');
  page.className = 'plugin-live-show';

  const stage = document.createElement('section');
  stage.className = 'live-show-stage';
  stage.innerHTML = `
    <div id="video-stream" class="live-show-stream">[ Mistress Live Stream Feed ]</div>
    <div class="live-show-actions">
      <button id="gift-btn" class="button-primary" type="button">Send Micro-Gift</button>
      <button id="req-btn" class="button-secondary" type="button">Send Special Request</button>
    </div>
    <div id="viewer-count" class="live-show-viewer-count">Live: ${viewerCount} Subs watching</div>
  `;

  page.appendChild(stage);
  page.appendChild(createLiveShowChatSidebar());

  return page;
}
