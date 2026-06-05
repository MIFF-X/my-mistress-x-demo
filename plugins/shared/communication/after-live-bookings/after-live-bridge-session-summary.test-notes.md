# After-Live Bridge Session Summary - Test Notes

Branch: `feature/abacus-ai-build`

This note documents the new shared bridge-session summary helper and the manual checks for the next UI wiring pass.

## File

```text
frontend/plugins/shared/communication/after-live-bookings/after-live-bridge-session-summary.js
```

## Purpose

This helper turns bridge provider responses into a clear card-style summary that can be reused on both sides of the after-live booking flow.

## Handles

```text
prepared
connected
active
disconnected
expired
failed
unknown
```

## Displays

```text
session id
booking id
provider name
provider session id
provider call sid
join url
auto-disconnect time
connected time
disconnected time
receipt id
wallet transaction id
```

## Manual UI targets

Next wiring pass should add this summary under bridge controls in:

```text
frontend/features/sub/after-live-bookings.js
frontend/features/mistress/after-live-booking-inbox.js
```

## Manual checks

1. Open an approved backend booking.
2. Click `Prepare Bridge`.
3. Confirm a bridge summary card appears with prepared/session details.
4. Click `Start Phone Bridge` or `Start Video Bridge`.
5. Confirm status updates to connected/active and shows join URL or provider session info.
6. Click `Disconnect Bridge`.
7. Confirm status updates to disconnected and shows disconnected time when returned.

## Fallback behaviour

For local demo bookings, keep the current message:

```text
Approved local booking: sync before starting a real bridge.
```

No bridge card should show until a backend bridge result exists.
