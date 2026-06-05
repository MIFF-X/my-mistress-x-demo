import { createReportButton } from '../dashboard/report-action.js';

export function createRolodexCardReportButton(card, statusEl) {
  return createReportButton({
    label: 'Report card',
    title: `Reported contact card: ${card.title || card.id}`,
    description: card.notes || 'Contact card reported from Rolodex panel.',
    targetType: 'profile',
    targetId: card.id,
    targetUserId: card.ownerUserId || card.createdById,
    area: 'PROFILE',
    priority: 'MEDIUM',
    metadata: {
      cardType: card.type,
      displayName: card.displayName,
      createdById: card.createdById,
      ownerUserId: card.ownerUserId,
      tags: card.tags,
    },
    onCreated: () => {
      if (statusEl) statusEl.innerText = 'Card report sent to moderation.';
    },
    onError: (error) => {
      if (statusEl) statusEl.innerText = error.message || 'Could not report card.';
    },
  });
}
