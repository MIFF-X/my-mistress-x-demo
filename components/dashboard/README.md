# Admin Command Centre Dashboard

This folder contains the frontend command-centre panels for the app branch.

## Main entry

- `HeadmistressCommandCentre.jsx`

This is the main mounted control room. It owns the sidebar navigation and switches between all major platform panels.

## Route/mount helpers

- `CommandCentreMount.jsx` — simple wrapper that renders `HeadmistressCommandCentre`.
- `commandCentreRoute.js` — route registry object for app/router wiring.

Recommended route object:

```js
{
  id: 'command-centre',
  label: 'Command Centre',
  path: '/command-centre',
  roles: ['HEADMISTRESS', 'ADMIN'],
  component: CommandCentreMount,
}
```

## Current sidebar tabs

- Overview
- Users
- Money Engine
- Live Feed
- Revenue
- Wallet
- Ledger Audit
- Chat Control
- Relationship Controls
- Profile Taxonomy
- Punishments
- Live Events
- Collector
- Sticker Generator
- Sticker Market
- Leaderboard
- Plugins
- Analytics
- Headmistress Controls

## Current mounted panels

- `RelationshipControlPanel.jsx` - block, ban, invisibility, extinguish action UI with duration presets, affected surfaces, API routes, action-row PNG slots, and audit-flow notes.

- `UsersPanel.jsx` — user list, refresh state, and future admin account actions.
- `RevenuePanel.jsx` — revenue summary and transaction-derived totals.
- `WalletPanel.jsx` — wallet balance and transaction history.
- `LedgerAuditPanel.jsx` — transaction audit view and split inspection.
- `ChatControlPanel.jsx` — chat room and message-review shell.
- `PluginControlPanel.jsx` — modular plugin toggles and plugin group controls.
- `SystemAnalyticsPanel.jsx` — analytics and platform intelligence shell.
- `ProfileTaxonomyGovernancePanel.jsx` — Mistress category, Sub label, profession, and services-offered review shell.
- `HeadmistressControlPanel.jsx` — global platform authority controls.
- `MonetisationDashboardPanel.jsx` — money engine overview by feature bucket.
- `LiveMoneyFeedPanel.jsx` — live-ready wallet/revenue feed.
- `CollectorPanel.jsx` — collector/sticker economy overview.
- `StickerGeneratorPanel.jsx` — sticker upload and preview shell.
- `StickerMarketplacePanel.jsx` — sticker listing/marketplace shell.
- `LeaderboardPanel.jsx` — ranking/status loop shell.
- `PunishmentPanel.jsx` — task/control loop shell.
- `LiveEventPanel.jsx` — live event trigger shell.

## Styling

- `command-centre.css`

This file provides the shared dark dashboard theme, responsive grid, sidebar, panels, stat cards, lists, and command notes.

## Shared services

- `../../services/api` provides `apiFetch` for REST calls.
- `../../services/socket` provides the shared Socket.IO client.
- `WebSocketMoneyFeed.js` now uses the shared socket service rather than opening a raw WebSocket.

## Current frontend pattern

Most panels are intentionally frontend-first. They either:

1. call existing backend APIs through `apiFetch`, or
2. show safe placeholder/local state while backend wiring is deferred.

This allows the UI and product flow to be designed without blocking on backend/database work.

## Backend later

The later backend pass should connect these panels to:

- JWT current user context.
- Wallet and ledger APIs.
- User search/status/role/audit endpoints.
- Relationship control feeds and Headmistress override/revoke endpoints.
- SystemEvent engine.
- WebSocket money/chat/event feeds.
- Notification service.
- Leaderboard aggregation.
- Sticker ownership and marketplace tables.
- Task assignment and completion tables.
- Admin audit logs.

## Universal platform rule

Every monetised or status-changing action should eventually follow:

`Action -> Wallet -> Ledger -> SystemEvent -> Notification -> Leaderboard -> Analytics -> Command Centre`
