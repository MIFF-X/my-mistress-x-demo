# Live Shows Plugin

This folder contains the starter live-session system for the app build branch.

## Purpose

The live shows plugin connects live rooms, discovery previews, category setup, saved setup drafts, launch handoff, and local analytics into one modular feature area.

## Main screens

- `live-rooms.js` — existing live room lobby with room cards, access states, and booking prompts.
- `live-hub-screen.js` — combined management hub for discovery, setup drafts, launch handoff, analytics, and live rooms.
- `discovery-screen.js` — quick preview/discovery flow with save, follow, skip, join, and preview timer actions.
- `live-category-setup-screen.js` — setup form for room title, category, custom fallback label, layout, free preview, and tier preview.
- `live-go-live-handoff-screen.js` — launch-prep screen that turns the latest saved setup into a demo live room.

## UI cards and panels

- `live-hub-shortcut-card.js` — small reusable dashboard card that opens the full Live Hub without rewriting large dashboard files.
- `discovery-shortcut-card.js` — opens the discovery flow.
- `discovery-analytics-summary.js` — local summary metrics for discovery events.
- `discovery-events-log.js` — recent discovery event audit trail.
- `live-latest-setup-card.js` — highlights the newest saved setup draft.
- `live-category-setups-list.js` — lists saved setup drafts.
- `live-launch-analytics-summary.js` — local summary metrics for launch/handoff events.
- `live-launch-events-log.js` — recent launch event audit trail.
- `live-funnel-overview.js` — combined overview across discovery, setup drafts, and launch handoff.

## Local stores

- `discovery-analytics-store.js` — local discovery funnel event store.
- `live-category-setup-store.js` — local saved setup draft store.
- `live-launch-analytics-store.js` — local launch/handoff event store.

These stores currently use local storage as a safe frontend scaffold. A backend pass can replace them with real API calls, persisted analytics, user IDs, room IDs, wallet outcomes, and admin reporting.

## API client scaffold

- `live-shows-api-client.js` — central frontend client for the planned backend endpoints.

The API client currently includes methods for:

- live room drafts
- latest draft lookup
- creating live rooms from drafts
- room listing and room detail lookup
- room status updates
- ending rooms
- discovery analytics events
- launch analytics events

The client is exported through `session-entrypoints.js` as `liveShowsApiClient`, so future screens can import it from one clean path when the backend is ready.

## Dashboard integration

For dashboard surfaces, prefer importing the small shortcut card instead of rewriting an entire dashboard file:

```js
import { createLiveHubShortcutCard } from "./session-entrypoints.js";
```

Then append the card to the dashboard section where live tools belong:

```js
container.appendChild(createLiveHubShortcutCard());
```

This keeps dashboard integration low-risk and avoids large rewrites when only a single entry card is needed.

## Configuration

- `live-show-categories.js` contains category options, layout options, live discovery config, free preview options, and tier preview options.
- `live-session-navigation.js` contains shared back/top-bar helpers for live-session screens.
- `session-entrypoints.js` re-exports the plugin screens, cards, stores, API client, and config so other app areas can import from one clean path.

## Current user flow

```text
Live Rooms
  -> Live Hub
    -> Live Discovery
    -> Category Setup
      -> Save Setup Draft
    -> Latest Setup Draft
      -> Go Live Handoff
        -> Enter Demo Live Room
```

## Store-to-API swap path

```text
localStorage demo store
  -> live-shows-api-client.js
  -> NestJS live module endpoints
  -> Prisma/PostgreSQL persistence
  -> real analytics and wallet/subscription checks
```

## Next backend pass

- Replace local storage stores with backend endpoints.
- Persist saved setup drafts per creator/admin account.
- Record discovery and launch analytics with user and room identifiers.
- Connect launch handoff to real live room creation.
- Connect preview/free-minute settings to wallet, subscriptions, and room access controls.
- Add moderation and compliance checks before a room goes live.
