# Live Access Stack

Frontend folder:

```text
frontend/src/features/live-access
```

Primary screen:

```text
LiveAccessStackScreen.tsx
```

This scaffold coordinates the live-room, paid-call booking, paid chat, watch-session, replay and consent-gate concepts from the external feature intake.

## Current Scope

The screen is intentionally additive. It does not replace the existing Live Room or Paid Calls / Bookings screens.

It adds a shared operating view for:

```text
public rooms
ticketed rooms
subscription rooms
invite/access-code rooms
private rooms
phone/video booking readiness
wallet pre-authorization planning
live sidebar modules
Watch With Mistress sessions
screen-share guardrails
live game overlays
```

## Existing Surfaces It Connects

```text
frontend/src/features/live/LiveRoomScreen.tsx
frontend/src/features/bookings/BookingsScreen.tsx
frontend/src/features/chat/ChatScreen.tsx
frontend/src/features/gifts/GiftsGoalsScreen.tsx
frontend/src/features/wallet/WalletScreen.tsx
```

## Production Handoff

The scaffold still needs backend/provider work before launch:

```text
room access-gate routes
websocket room lifecycle events
wallet pre-authorization holds and settlement
calendar reminders
media sync provider for watch sessions
replay entitlement checks
moderation and incident audit routes
game overlay providers
legal/compliance review for screen-share wording
```

## Verification

Run frontend typecheck after edits:

```bash
cd frontend
npm run typecheck
```
