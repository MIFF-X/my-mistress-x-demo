import { liveShowsApi } from './live-shows-api.js';
import { getAuthRole } from '../auth/auth-client.js';
import { createReportButton } from '../dashboard/report-action.js';

function createInput({ id, type = 'text', placeholder }) {
  const input = document.createElement('input');
  input.id = id;
  input.type = type;
  input.placeholder = placeholder;
  input.className = 'input-field';
  return input;
}

function createButton(label, className = 'button-secondary') {
  const button = document.createElement('button');
  button.className = className;
  button.innerText = label;
  return button;
}

function createShowCard(show, onRefresh, statusEl) {
  const card = document.createElement('article');
  card.className = 'panel live-show-card';

  const title = document.createElement('h3');
  title.innerText = show.title || 'Untitled Live Show';

  const ticketCount = Array.isArray(show.tickets) ? show.tickets.length : 0;

  const meta = document.createElement('p');
  meta.innerText = `${show.status || 'SCHEDULED'} · ${Number(show.ticketPrice || 0).toFixed(2)} credits · ${ticketCount} ticket${ticketCount === 1 ? '' : 's'} · ${show.scheduledAt || 'No schedule set'}`;

  const description = document.createElement('p');
  description.innerText = show.description || 'No description provided.';

  const controls = document.createElement('div');
  controls.className = 'button-row';

  if (getAuthRole() === 'MISTRESS') {
    const startBtn = createButton('Start Show', 'button-primary');
    startBtn.disabled = show.status === 'LIVE' || show.status === 'ENDED';
    startBtn.onclick = async () => {
      await liveShowsApi.startShow(show.id);
      statusEl.innerText = `Started ${show.title || 'show'}.`;
      await onRefresh?.();
    };

    const endBtn = createButton('End Show');
    endBtn.disabled = show.status !== 'LIVE';
    endBtn.onclick = async () => {
      await liveShowsApi.endShow(show.id);
      statusEl.innerText = `Ended ${show.title || 'show'}.`;
      await onRefresh?.();
    };

    controls.appendChild(startBtn);
    controls.appendChild(endBtn);
  }

  const buyTicketBtn = createButton('Buy Ticket', 'button-primary');
  buyTicketBtn.disabled = show.status === 'ENDED' || show.status === 'CANCELLED';
  buyTicketBtn.onclick = async () => {
    try {
      await liveShowsApi.buyTicket(show.id);
      statusEl.innerText = `Ticket purchased for ${show.title || 'show'}.`;
      buyTicketBtn.innerText = 'Ticket Purchased';
      buyTicketBtn.disabled = true;
      await onRefresh?.();
    } catch (err) {
      statusEl.innerText = err.message || 'Could not buy ticket.';
    }
  };

  const tipInput = createInput({ id: `tip-${show.id}`, type: 'number', placeholder: 'Tip credits' });
  const tipBtn = createButton('Send Tip');
  tipBtn.onclick = async () => {
    const amount = Number(tipInput.value || 0);
    if (!amount) return;

    try {
      await liveShowsApi.tip({
        targetUserId: show.mistressUserId,
        amount,
        showId: show.id,
      });

      tipInput.value = '';
      statusEl.innerText = `Sent ${amount.toFixed(2)} credits tip for ${show.title || 'show'}.`;
    } catch (err) {
      statusEl.innerText = err.message || 'Could not send tip.';
    }
  };

  const reportBtn = createReportButton({
    label: 'Report show',
    title: `Reported live show: ${show.title || show.id}`,
    description: show.description || 'Live show reported from live shows panel.',
    targetType: 'liveShow',
    targetId: show.id,
    targetUserId: show.mistressUserId,
    area: 'LIVE_SHOW',
    priority: 'MEDIUM',
    metadata: {
      showStatus: show.status,
      scheduledAt: show.scheduledAt,
      ticketPrice: show.ticketPrice,
    },
    onCreated: () => {
      statusEl.innerText = 'Live show report sent to moderation.';
    },
    onError: (error) => {
      statusEl.innerText = error.message || 'Could not report live show.';
    },
  });

  controls.appendChild(buyTicketBtn);
  controls.appendChild(tipInput);
  controls.appendChild(tipBtn);
  controls.appendChild(reportBtn);

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(description);
  card.appendChild(controls);

  return card;
}

function createLiveShowForm(onCreated) {
  const form = document.createElement('div');
  form.className = 'panel live-show-form';

  const title = document.createElement('h3');
  title.innerText = 'Create Live Show';

  const titleInput = createInput({ id: 'live-title', placeholder: 'Show title' });
  const descriptionInput = createInput({ id: 'live-description', placeholder: 'Description' });
  const priceInput = createInput({ id: 'live-ticket-price', type: 'number', placeholder: 'Ticket price / tip base in credits' });
  const scheduledInput = createInput({ id: 'live-scheduled-at', type: 'datetime-local', placeholder: 'Scheduled time' });
  const durationInput = createInput({ id: 'live-duration', type: 'number', placeholder: 'Duration minutes' });

  const error = document.createElement('p');
  error.className = 'form-error';
  error.style.display = 'none';

  const submit = createButton('Create Live Show', 'button-primary');
  submit.onclick = async () => {
    error.style.display = 'none';

    try {
      const show = await liveShowsApi.createShow({
        title: titleInput.value,
        description: descriptionInput.value,
        ticketPrice: Number(priceInput.value || 0),
        scheduledAt: scheduledInput.value || undefined,
        durationMinutes: durationInput.value ? Number(durationInput.value) : undefined,
        chatEnabled: true,
        giftsEnabled: true,
      });

      titleInput.value = '';
      descriptionInput.value = '';
      priceInput.value = '';
      scheduledInput.value = '';
      durationInput.value = '';

      await onCreated?.(show);
    } catch (err) {
      error.innerText = err.message || 'Could not create live show.';
      error.style.display = 'block';
    }
  };

  form.appendChild(title);
  form.appendChild(titleInput);
  form.appendChild(descriptionInput);
  form.appendChild(priceInput);
  form.appendChild(scheduledInput);
  form.appendChild(durationInput);
  form.appendChild(error);
  form.appendChild(submit);

  return form;
}

export function createLiveShowsPanel() {
  const shell = document.createElement('section');
  shell.className = 'page-shell live-shows-panel';

  const title = document.createElement('h2');
  title.innerText = 'Live Shows';

  const helper = document.createElement('p');
  helper.innerText = 'Schedule shows, buy tickets, start/end live sessions, and send wallet-backed tips.';

  const error = document.createElement('p');
  error.className = 'form-error';
  error.style.display = 'none';

  const status = document.createElement('p');
  status.className = 'live-show-status';

  const refreshBtn = createButton('Refresh Live Shows');

  const list = document.createElement('div');
  list.className = 'dashboard-card-grid live-shows-list';

  async function loadShows() {
    error.style.display = 'none';
    list.innerHTML = '';

    try {
      const shows = await liveShowsApi.listShows();

      if (!Array.isArray(shows) || shows.length === 0) {
        const empty = document.createElement('p');
        empty.innerText = 'No live shows scheduled yet.';
        list.appendChild(empty);
        return;
      }

      shows.forEach((show) => list.appendChild(createShowCard(show, loadShows, status)));
    } catch (err) {
      error.innerText = err.message || 'Could not load live shows.';
      error.style.display = 'block';
    }
  }

  refreshBtn.onclick = loadShows;

  shell.appendChild(title);
  shell.appendChild(helper);

  if (getAuthRole() === 'MISTRESS') {
    shell.appendChild(createLiveShowForm(async (show) => {
      status.innerText = `Created live show: ${show.title || 'show'}.`;
      await loadShows();
    }));
  }

  shell.appendChild(refreshBtn);
  shell.appendChild(error);
  shell.appendChild(status);
  shell.appendChild(list);

  loadShows();

  return shell;
}
