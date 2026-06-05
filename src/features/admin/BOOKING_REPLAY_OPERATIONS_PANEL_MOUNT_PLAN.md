# Booking Replay Operations Panel Mount Plan

Branch: `feature/abacus-ai-build`

This file locks the next safe UI mount for the combined Admin Command Centre replay operations panel.

## New component ready

```text
frontend/src/features/admin/BookingReviewReplayOperationsPanel.tsx
```

## Components wrapped by it

```text
frontend/src/features/admin/BookingReviewReplayQueueSummaryPanel.tsx
frontend/src/features/admin/BookingReviewOwnerDrilldownPanel.tsx
frontend/src/features/admin/BookingReviewReplayDetailPanel.tsx
frontend/src/features/admin/BookingReviewReplayAlertPanel.tsx
```

## Helpers already covered

```text
frontend/src/features/admin/bookingReviewReplayQueueSummaryHelpers.ts
frontend/src/features/admin/bookingReviewReplayQueueSummaryHelpers.test.ts
frontend/src/features/admin/bookingReviewReplayOwnerDrilldownHelpers.ts
frontend/src/features/admin/bookingReviewReplayOwnerDrilldownHelpers.test.ts
frontend/src/features/admin/bookingReviewReplayDetailHelpers.ts
frontend/src/features/admin/bookingReviewReplayDetailHelpers.test.ts
frontend/src/features/admin/bookingReviewReplayAlertHelpers.ts
frontend/src/features/admin/bookingReviewReplayAlertHelpers.test.ts
```

## Current screen target

```text
frontend/src/features/admin/AdminCommandCentreScreen.tsx
```

## Import to add

```ts
import { BookingReviewReplayOperationsPanel } from './BookingReviewReplayOperationsPanel';
```

## Mount location

Inside the existing `Recent Batch History` block, after the outcome / alert / reminder filters and before the list of recent batch rows.

Search anchors:

```text
Recent Batch History
BOOKING_REPLAY_REMINDER_STATUS_FILTERS
bookingReviewBatchHistory.slice(0, 4).map
```

## JSX to add

```tsx
<BookingReviewReplayOperationsPanel
  batchHistory={bookingReviewBatchHistory}
  replayDetail={bookingReviewBatchReplayDetail}
  alertOwnerId={bookingReviewBatchAlertOwnerFilter}
  onOwnerSelected={(ownerId) => {
    setBookingReviewBatchAlertOwnerFilter(ownerId);
    applyBookingReviewBatchAlertFilters(bookingReviewBatchAlertFilter, ownerId);
  }}
  onOwnerCsvExport={(csvText) => {
    setBookingReviewExportText(csvText);
    setBookingReviewExportNotice(downloadTextFile(
      csvText,
      'booking-replay-owner-drilldown.csv',
      'text/csv;charset=utf-8',
    ));
  }}
  onAlertUpdated={(detail) => {
    setBookingReviewBatchReplayDetail(detail);
    loadBookings();
  }}
  onStatus={setActionMessage}
  onDownloadReplayCsv={handleBookingReviewBatchReplayReportDownload}
/>
```

## Cleanup after mount

Once the combined panel is mounted and typechecked, reduce duplicated inline blocks for:

```text
Replay Alert Queue Health summary cards
Replay Alert Owner Drilldown cards
Replay Audit Detail inline stale-alert block
Acknowledge Alert / Escalate Alert duplicate buttons
```

## Manual verification

```text
Admin Command Centre
→ Bookings tab
→ Recent Batch History
→ Replay Operations panel appears
→ Queue health cards show
→ Owner cards show
→ Owner CSV export works
→ Replay Detail loads after clicking a batch row
→ Acknowledge / Escalate / Retry Failed Rows actions still work through reusable panel
```

## Local verification

```bash
cd frontend
npm run typecheck
```

If Expo base tsconfig is still missing locally, record the same known blocker already listed in the coverage checkpoint.
