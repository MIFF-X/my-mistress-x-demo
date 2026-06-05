import { createVideoCallTimer } from './video-call-timer.js';

export function createVideoCallInterface(durationMinutes = 15) {
  const container = document.createElement('div');
  container.className = 'plugin-video-interface';

  container.innerHTML = `
    <div id="video-stream-main">[ ACTIVE VIDEO CALL ]</div>
    <div id="call-timer">
      Time Remaining: <span id="timer-display">${durationMinutes}:00</span>
    </div>
    <div class="video-call-controls">
      <button class="button-secondary" type="button" data-action="mute">Mute</button>
      <button class="button-secondary" type="button" data-action="end">End Call</button>
      <button class="button-primary" type="button" data-action="tip">Request Tip</button>
    </div>
  `;

  const timerDisplay = container.querySelector('#timer-display');
  const timer = createVideoCallTimer({
    durationMinutes,
    onTick: ({ display }) => {
      timerDisplay.innerText = display;
    },
    onComplete: () => {
      container.dispatchEvent(new CustomEvent('video-call:end', {
        detail: { reason: 'timer_complete' },
      }));
    },
  });

  container.querySelector('[data-action="end"]').onclick = () => {
    timer.stop();
    container.dispatchEvent(new CustomEvent('video-call:end', {
      detail: { reason: 'host_or_viewer_end' },
    }));
  };

  timer.start();
  return container;
}
