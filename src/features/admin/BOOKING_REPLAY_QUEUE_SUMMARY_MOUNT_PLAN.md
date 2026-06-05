# Booking Replay Queue Summary Mount Plan

Branch: `feature/abacus-ai-build`

This file locks the next safe UI mount for the Admin Command Centre booking replay-alert queue health panel.

## New component ready

```text
frontend/src/features/admin/BookingReviewReplayQueueSummaryPanel.tsx
```

## Helper ready

```text
frontend/src/features/admin/bookingReviewReplayQueueSummaryHelpers.ts
frontend/src/features/admin/bookingReviewReplayQueueSummaryHelpers.test.ts
```

## Current screen target

```text
frontend/src/features/admin/AdminCommandCentreScreen.tsx
```

## Mount location

Inside the existing `Recent Batch History` block, directly above the replay-alert rollup cards and before the owner drilldown panel.

Search anchors:

```text
Recent Batch History
replayAlertRollups.stale
bookingReviewBatchHistory.length
```

## Import to add

```ts
import { BookingReviewReplayQueueSummaryPanel } from './BookingReviewReplayQueueSummaryPanel';
```

## JSX to add

```tsx
<BookingReviewReplayQueueSummaryPanel rows={bookingReviewBatchHistory} />
```

## Behaviour after mount

The panel should show queue health for the current batch-history filters:

```text
Healthy
Monitoring
Attention needed
Escalation needed
```

It should also show compact cards for:

```text
Rows
Stale
Escalated
Reminders
```

## Verification

```bash
cd frontend
npm run typecheck
```

Manual flow:

```text
Admin Command Centre
→ Bookings tab
→ Recent Batch History
→ Replay Alert Queue Health appears
→ Change outcome / alert / reminder filters
→ Queue health cards update with current rows
```

## Why this is next

The queue summary helper and tests are already in place. Mounting this panel makes the replay-alert workload status visible before admins drill into owners, replay batches, or individual failed rows.
