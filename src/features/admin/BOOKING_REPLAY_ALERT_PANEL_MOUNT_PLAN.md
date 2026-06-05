# Booking Replay Alert Panel Mount Plan

Branch: `feature/abacus-ai-build`

This file locks the next safe UI mount for the Admin Command Centre replay-alert workflow.

## New component ready

```text
frontend/src/features/admin/BookingReviewReplayAlertPanel.tsx
```

## Helper ready

```text
frontend/src/features/admin/bookingReviewReplayAlertHelpers.ts
frontend/src/features/admin/bookingReviewReplayAlertHelpers.test.ts
```

## Current screen target

```text
frontend/src/features/admin/AdminCommandCentreScreen.tsx
```

## Mount location

Inside the existing `bookingReviewBatchReplayDetail ? (...) : null` section, immediately after the replay summary cards and before the older stale-alert inline block.

Search anchor:

```text
Replay Audit Detail
bookingReviewReplaySummaryCards(bookingReviewBatchReplayDetail)
```

## Import to add

```ts
import { BookingReviewReplayAlertPanel } from './BookingReviewReplayAlertPanel';
```

## JSX to add

```tsx
<BookingReviewReplayAlertPanel
  detail={bookingReviewBatchReplayDetail}
  onUpdated={(detail) => {
    setBookingReviewBatchReplayDetail(detail);
    loadBookings();
  }}
  onStatus={setActionMessage}
/>
```

## Cleanup after mount

After the panel is confirmed working, the older inline stale-alert action block can be reduced or removed to avoid duplicated buttons:

```text
Acknowledge Alert
Escalate Alert
```

## Reason

The panel centralises replay alert state, default notes, acknowledge/escalate actions, and failed-row retry into a reusable component. This keeps the main Admin Command Centre screen from getting larger and makes the replay-alert workflow easier to test.

## Verification

```bash
cd frontend
npm run typecheck
```

Manual check:

```text
Admin Command Centre → Bookings tab → Batch history → Replay Detail → alert panel appears → Acknowledge / Escalate / Retry Failed Rows actions update status message.
```
