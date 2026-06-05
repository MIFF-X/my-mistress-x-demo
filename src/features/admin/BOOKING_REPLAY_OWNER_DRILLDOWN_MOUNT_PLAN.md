# Booking Replay Owner Drilldown Mount Plan

Branch: `feature/abacus-ai-build`

This file locks the next safe UI mount for the Admin Command Centre replay-alert owner/assignee drilldown workflow.

## New component ready

```text
frontend/src/features/admin/BookingReviewOwnerDrilldownPanel.tsx
```

## Helper ready

```text
frontend/src/features/admin/bookingReviewReplayOwnerDrilldownHelpers.ts
frontend/src/features/admin/bookingReviewReplayOwnerDrilldownHelpers.test.ts
```

## Current screen target

```text
frontend/src/features/admin/AdminCommandCentreScreen.tsx
```

## Mount location

Inside the existing `Recent Batch History` block, immediately after the replay-alert rollup cards and before the outcome/status/reminder filter chips.

Search anchor:

```text
Recent Batch History
replayAlertRollups.stale
replayAlertRollups.unacknowledged
```

## Import to add

```ts
import { BookingReviewOwnerDrilldownPanel } from './BookingReviewOwnerDrilldownPanel';
```

## JSX to add

```tsx
<BookingReviewOwnerDrilldownPanel
  rows={bookingReviewBatchHistory}
  onOwnerSelected={(ownerId) => {
    setBookingReviewBatchAlertOwnerFilter(ownerId);
    applyBookingReviewBatchAlertFilters(bookingReviewBatchAlertFilter, ownerId);
  }}
  onExportCsv={(csvText) => {
    setBookingReviewExportText(csvText);
    setBookingReviewExportNotice(downloadTextFile(
      csvText,
      'booking-replay-owner-drilldown.csv',
      'text/csv;charset=utf-8',
    ));
  }}
/>
```

## Behaviour after mount

The panel should show owner cards for replay-alert work grouped by:

```text
latestAlertAssignedToId
assignedToId
UNASSIGNED fallback
```

Clicking an owner should apply the owner filter and refresh batch history for that owner.

The Owner CSV button should export the current owner drilldown summary.

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
→ Replay Alert Owner Drilldown
→ click owner card
→ batch history filters to that owner
→ click Owner CSV
→ CSV download/text appears
```

## Why this is next

The stale replay alert system now has summary cards, filters, exports, reminders, helpers, tests, and a reusable owner panel. Mounting this panel makes it visible to the Headmistress/admin workflow without expanding the already-large command centre file with more inline logic.
