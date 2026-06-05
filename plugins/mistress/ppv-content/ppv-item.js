export function createPPVItem(input = {}) {
  const accessType = normalizePPVAccessType(input.accessType || input.type);
  const durationMinutes = accessType === 'timed' ? resolveDurationMinutes(input) : null;

  return {
    id: input.id || `ppv-${Date.now()}`,
    title: input.title || 'Untitled PPV Item',
    description: input.description || '',
    priceCredits: Number(input.priceCredits ?? input.price ?? 0),
    accessType,
    durationHours: durationMinutes === null ? null : durationMinutes / 60,
    durationMinutes,
    mediaUrl: input.mediaUrl || '',
    thumbnailUrl: input.thumbnailUrl || input.mediaUrl || '',
    status: input.status || 'draft',
    createdAt: input.createdAt || new Date().toISOString(),
    tags: Array.isArray(input.tags) ? [...input.tags] : [],
    metadata: { ...(input.metadata || {}) },
  };
}

export function describePPVAccess(item) {
  const accessType = normalizePPVAccessType(item.accessType);

  if (accessType === 'subscription') {
    return 'Included in subscription bundle';
  }

  if (accessType === 'timed') {
    return `${formatDuration(resolveDurationMinutes(item))} access`;
  }

  if (accessType === 'free') {
    return 'Free access';
  }

  return 'Buy to keep';
}

export function resolvePPVAccessWindow(item, purchasedAt = new Date()) {
  const accessType = normalizePPVAccessType(item.accessType);
  const startsAt = new Date(purchasedAt);

  if (accessType !== 'timed') {
    return {
      startsAt: startsAt.toISOString(),
      expiresAt: null,
      isTimed: false,
    };
  }

  const expiresAt = new Date(startsAt);
  expiresAt.setMinutes(expiresAt.getMinutes() + resolveDurationMinutes(item));

  return {
    startsAt: startsAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isTimed: true,
  };
}

export function isPPVAccessActive(item, purchasedAt, now = new Date()) {
  const window = resolvePPVAccessWindow(item, purchasedAt);

  if (!window.isTimed) {
    return true;
  }

  return new Date(now).getTime() <= new Date(window.expiresAt).getTime();
}

export function createPPVItemCard(item, { onUnlock } = {}) {
  const normalized = createPPVItem(item);
  const card = document.createElement('article');
  card.className = `ppv-item-card is-${normalized.status}`;

  card.innerHTML = `
    <div class="ppv-item-thumb"></div>
    <div class="ppv-item-body">
      <h4>${normalized.title}</h4>
      <p>${normalized.description || describePPVAccess(normalized)}</p>
      <div class="ppv-item-meta">
        <span>${normalized.priceCredits} credits</span>
        <span>${describePPVAccess(normalized)}</span>
      </div>
    </div>
    <button class="button-primary ppv-item-unlock" type="button">Unlock</button>
  `;

  const thumb = card.querySelector('.ppv-item-thumb');
  if (normalized.thumbnailUrl) {
    thumb.style.backgroundImage = `url("${normalized.thumbnailUrl}")`;
  }

  card.querySelector('.ppv-item-unlock').onclick = () => {
    if (typeof onUnlock === 'function') {
      onUnlock(normalized);
    }

    card.dispatchEvent(new CustomEvent('ppv-item:unlock', {
      detail: normalized,
    }));
  };

  return card;
}

function normalizePPVAccessType(value = 'keep') {
  if (['subscription', 'subscription_bundle', 'subscription_included'].includes(value)) {
    return 'subscription';
  }

  if (['timed', 'timed_access', 'twenty_four_hours', 'pay_per_view'].includes(value)) {
    return 'timed';
  }

  if (['free', 'free_preview'].includes(value)) {
    return 'free';
  }

  return 'keep';
}

function resolveDurationMinutes(input = {}) {
  const minutes = Number(input.durationMinutes ?? input.accessDurationMinutes ?? input.accessMinutes);

  if (Number.isFinite(minutes) && minutes > 0) {
    return Math.round(minutes);
  }

  const hours = Number(input.durationHours);
  return Number.isFinite(hours) && hours > 0 ? Math.round(hours * 60) : 24 * 60;
}

function formatDuration(minutes) {
  if (minutes % 60 === 0) {
    return `${minutes / 60} hour`;
  }

  return `${minutes} minute`;
}
