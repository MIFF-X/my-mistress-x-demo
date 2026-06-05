import { AdminBookingReviewBatchHistory } from '../../api/adminCommandApi';

export type BookingReplayOwnerDrilldown = {
  ownerId: string;
  label: string;
  totalBatches: number;
  staleBatches: number;
  overdueReminders: number;
  acknowledged: number;
  escalated: number;
  latestActivityAt: string | null;
  batchIds: string[];
  tone: string;
  summary: string;
};

function batchId(row: AdminBookingReviewBatchHistory) {
  const metadata = (row.metadata || {}) as Record<string, unknown>;
  return String(metadata.batchId || row.targetId || row.id);
}

function failedRowAgeHours(createdAt: string) {
  const createdTime = new Date(createdAt).getTime();
  if (!Number.isFinite(createdTime)) return null;
  return Math.max(0, Math.floor((Date.now() - createdTime) / 36e5));
}

function isStaleFailure(row: AdminBookingReviewBatchHistory) {
  const metadata = (row.metadata || {}) as Record<string, unknown>;
  const failed = Number(metadata.failed || 0);
  const replayed = metadata.replayAction === true || Boolean(metadata.sourceBatchId);
  const ageHours = failedRowAgeHours(row.createdAt);
  return failed > 0 && !replayed && ageHours !== null && ageHours >= 24;
}

function ownerLabel(row: AdminBookingReviewBatchHistory) {
  const metadata = (row.metadata || {}) as Record<string, unknown>;
  const ownerId = String(metadata.latestAlertAssignedToId || metadata.assignedToId || 'UNASSIGNED');
  if (ownerId !== 'UNASSIGNED') return ownerId;
  return 'Unassigned';
}

export function buildBookingReplayOwnerDrilldowns(rows: AdminBookingReviewBatchHistory[]): BookingReplayOwnerDrilldown[] {
  const map = new Map<string, BookingReplayOwnerDrilldown>();

  rows.forEach((row) => {
    const metadata = (row.metadata || {}) as Record<string, unknown>;
    const ownerId = String(metadata.latestAlertAssignedToId || metadata.assignedToId || 'UNASSIGNED');
    const existing = map.get(ownerId) || {
      ownerId,
      label: ownerLabel(row),
      totalBatches: 0,
      staleBatches: 0,
      overdueReminders: 0,
      acknowledged: 0,
      escalated: 0,
      latestActivityAt: null,
      batchIds: [],
      tone: '#777',
      summary: '',
    };

    const alertStatus = String(metadata.latestAlertStatus || '').toUpperCase();
    existing.totalBatches += 1;
    existing.batchIds.push(batchId(row));
    if (isStaleFailure(row)) existing.staleBatches += 1;
    if (metadata.retryReminderOverdue === true || alertStatus === 'RETRY_REMINDER_OVERDUE') existing.overdueReminders += 1;
    if (alertStatus === 'ACKNOWLEDGED') existing.acknowledged += 1;
    if (alertStatus === 'ESCALATED') existing.escalated += 1;

    const activityTime = new Date(String(metadata.latestAlertAt || row.createdAt)).toISOString();
    if (!existing.latestActivityAt || new Date(activityTime).getTime() > new Date(existing.latestActivityAt).getTime()) {
      existing.latestActivityAt = activityTime;
    }

    map.set(ownerId, existing);
  });

  return Array.from(map.values())
    .map((row) => {
      const tone = row.escalated || row.overdueReminders || row.staleBatches ? '#ff6b6b' : row.acknowledged ? '#d4af37' : '#1D9E75';
      return {
        ...row,
        tone,
        summary: `${row.totalBatches} batch(es), ${row.staleBatches} stale, ${row.overdueReminders} overdue reminder(s), ${row.escalated} escalated.`,
      };
    })
    .sort((a, b) => b.escalated - a.escalated || b.overdueReminders - a.overdueReminders || b.staleBatches - a.staleBatches || b.totalBatches - a.totalBatches || a.label.localeCompare(b.label));
}

export function bookingReplayOwnerDrilldownCsv(rows: BookingReplayOwnerDrilldown[]) {
  const header = 'ownerId,label,totalBatches,staleBatches,overdueReminders,acknowledged,escalated,latestActivityAt,batchIds';
  const body = rows.map((row) => [
    row.ownerId,
    row.label,
    row.totalBatches,
    row.staleBatches,
    row.overdueReminders,
    row.acknowledged,
    row.escalated,
    row.latestActivityAt || '',
    row.batchIds.join('|'),
  ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','));
  return [header, ...body].join('\n');
}
