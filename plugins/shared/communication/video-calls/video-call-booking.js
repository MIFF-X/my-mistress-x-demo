export function createVideoCallBooking({ onSave } = {}) {
  const container = document.createElement('div');
  container.className = 'plugin-video-booking';

  container.innerHTML = `
    <div class="video-booking-panel">
      <h3>Schedule a Paid Video Call</h3>
      <p>Set availability and pricing for one-on-one sessions.</p>
      <label>
        Price per minute
        <input id="call-price" type="number" min="0" placeholder="10">
      </label>
      <label>
        Minimum duration
        <input id="call-min-duration" type="number" min="1" placeholder="15">
      </label>
      <label>
        Availability
        <input id="call-availability" type="text" placeholder="6 PM - 10 PM">
      </label>
      <div class="video-booking-actions">
        <button id="save-booking-settings" class="button-primary" type="button">Save Call Settings</button>
        <button id="view-calendar" class="button-secondary" type="button">View Booking Calendar</button>
      </div>
    </div>
  `;

  container.querySelector('#save-booking-settings').onclick = () => {
    const settings = readVideoCallBookingSettings(container);

    if (typeof onSave === 'function') {
      onSave(settings);
    }

    container.dispatchEvent(new CustomEvent('video-call-booking:save', {
      detail: settings,
    }));
  };

  return container;
}

export function readVideoCallBookingSettings(container) {
  return {
    pricePerMinute: Number(container.querySelector('#call-price')?.value || 0),
    minimumDurationMinutes: Number(container.querySelector('#call-min-duration')?.value || 0),
    availability: container.querySelector('#call-availability')?.value || '',
  };
}
