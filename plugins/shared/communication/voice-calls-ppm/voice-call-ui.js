import { createPPMVoiceService } from './voice-call-ppm.js';

export function createVoiceCallInterface(mistressName = 'Mistress', rate = 5) {
  const container = document.createElement('div');
  container.className = 'ppm-voice-ui';

  container.innerHTML = `
    <div class="voice-call-kicker">Live Voice Control</div>
    <h2>Connected to ${mistressName}</h2>
    <div class="voice-call-meter">
      <div id="ppm-timer">0:00</div>
      <div id="ppm-cost">$0.00</div>
      <div id="ppm-multiplier-tag">RATE: 1x (NORMAL)</div>
    </div>
    <div class="voice-call-actions">
      <button id="btn-punish" type="button">PUNISH (2x RATE)</button>
      <button id="btn-mercy" type="button">NORMAL RATE</button>
    </div>
    <button id="btn-end-call" type="button">TERMINATE SESSION</button>
  `;

  const service = createPPMVoiceService({ rate, subWallet: 150 });
  const timerEl = container.querySelector('#ppm-timer');
  const costEl = container.querySelector('#ppm-cost');
  const tagEl = container.querySelector('#ppm-multiplier-tag');

  service.startCall(
    (data) => {
      timerEl.innerText = data.time;
      costEl.innerText = `$${data.cost}`;
      tagEl.innerText = data.multiplier > 1
        ? `PUNISHMENT MODE: ${data.multiplier}x RATE`
        : 'RATE: 1x (NORMAL)';
      tagEl.classList.toggle('is-punishment', data.multiplier > 1);
    },
    (finalCost, reason) => {
      container.dispatchEvent(new CustomEvent('voice-call:end', {
        detail: { finalCost, reason },
      }));
    },
  );

  container.querySelector('#btn-punish').onclick = () => service.setMultiplier(2);
  container.querySelector('#btn-mercy').onclick = () => service.setMultiplier(1);
  container.querySelector('#btn-end-call').onclick = () => {
    service.stopCall((finalCost, reason) => {
      container.dispatchEvent(new CustomEvent('voice-call:end', {
        detail: { finalCost, reason },
      }));
    });
  };

  return container;
}
