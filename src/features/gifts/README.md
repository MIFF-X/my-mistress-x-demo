# Gifts & Goals Frontend

Status: scaffolded user-facing surface.

This screen connects the existing virtual gift catalogue and the database-backed goal fund APIs.

## Connected Routes

- `GET /api/gifts`
- `POST /api/gifts/send`
- `GET /api/goals/funds/public`
- `GET /api/goals/funds/mine`
- `POST /api/goals/funds`
- `POST /api/goals/funds/:fundId/activate`
- `POST /api/goals/funds/:fundId/pause`
- `POST /api/goals/funds/:fundId/archive`
- `POST /api/goals/funds/:fundId/contribute`
- `GET /api/goals/funds/:fundId/receipts`
- `GET /api/goals/funds/receipts/mine`
- `GET /api/goals/funds/receipts/mine/export.csv`

## Current UI

- Gift rail for selecting an active virtual gift.
- Sub-facing public goal fund list with contribution amount, optional message, selected gift send, and receipt loading.
- Mistress-facing goal manager for creating draft public funds and activating, pausing, or archiving them.
- Latest receipt panel showing gross contribution, Mistress share, and platform share.
- Contribution history panel that uses the dedicated current-user receipt endpoint and server-generated CSV statement export text.
- Export controls for web CSV download plus copy/manual-save fallback when native file APIs are unavailable.
- Native share-sheet action for sharing the CSV statement text from mobile builds.
- Lightweight success overlay for virtual gift sends and goal fund contributions.
- Reusable animated `GiftEffectOverlay` component ready for chat/live room gift effects.
- Chat gift sends now trigger `GiftEffectOverlay` and add a local gift activity card.
- Live room micro-gift tips now trigger `GiftEffectOverlay` for sender and incoming socket tip feedback.
- Premium gift effect presets map seeded catalogue gifts to reusable badges and accent colors in the gift rail, picker, and overlays.
- Premium gift button pack manifest maps seeded catalogue gifts to fallback glyphs and final PNG asset slots.

## Still Needed

- Dedicated public profile route for viewing other Mistress profiles outside the current dashboard.
- File-attachment share/export polish if the app later adds a native filesystem helper.
- Final transparent PNG exports for the premium gift button pack.
- Wider button/icon pack for chat, calls, video, wishlist, store, positions, and control actions.
- Cash-out/payout workflow for eligible goal and gift receipts.
