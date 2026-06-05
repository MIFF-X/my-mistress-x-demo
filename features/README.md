# Mistress-X Frontend Features Index

This folder contains the visible frontend feature layer for the `feature/abacus-ai-build` app branch. It includes role dashboards, feature placeholders, plugin bridge screens, and migration targets that make the app journey visible while backend/API/database work continues.

The browser scaffold is exposed through:

```text
frontend/index.html
frontend/index.js
```

## Feature Vs Plugin Rule

`frontend/features/` is for required product journeys and core app surfaces:
auth, users, dashboards, wallet/payment flows, profile, routing, safety gates,
and other modules that every build depends on.

`frontend/plugins/` is the canonical home for optional or installable add-ons:
games, ebooks, leaderboards, punishments, wall-of-shame, live-show extras,
store add-ons, role-specific tools, and any module that can later be enabled,
disabled, sold, configured, or swapped.

`frontend/features/plugins/` remains only as a temporary bridge for older
imports and route visibility while we migrate toward the single plugin hub.

## Feature Folders

```text
admin/
auth/
badges/
catalog/
collectibles/
compliance/
content/
dashboard/
gifts/
head-mistress/
live/
live-shows/
marketplace/
messaging/
mistress/
money/
mvp/
notifications/
payments/
plugins/
positions/
ppv/
profile/
progress/
rolodex/
search/
settings/
smm/
stickers/
styling/
sub/
sub-black-book/
subscriptions/
ui/
uploads/
users/
wallet/
```

## Role And Domain Areas

| Area | Purpose |
| --- | --- |
| `auth/` | Login, register, and account entry surfaces. |
| `head-mistress/` | Headmistress oversight, analytics, and command surfaces. |
| `mistress/` | Mistress-facing dashboards, profile, rewards, and creator workflows. |
| `sub/` | Sub-facing dashboards, profile, redemption, and relationship surfaces. |
| `payments/`, `money/`, `wallet/` | Payment UI, wallet actions, top-ups, and earnings views. |
| `content/`, `ppv/`, `live/`, `live-shows/` | Content, paid unlock, live room, and live show journeys. |
| `marketplace/`, `gifts/`, `subscriptions/` | Commerce, gifting, inventory, and recurring access surfaces. |
| `plugins/` | Temporary plugin bridge and registry/dashboard screens while canonical plugin code moves to `frontend/plugins/`. |

## Placeholder Screens

```text
admin/admin-panel-placeholder.js
admin/headmistress-command-centre-placeholder.js
auth/login-placeholder.js
auth/register-placeholder.js
badges/badge-awards-trophy-system-placeholder.js
catalog/product-grid-placeholder.js
collectibles/sticker-collector-system-placeholder.js
compliance/compliance-shield-placeholder.js
content/ppv-content-library-placeholder.js
live/live-shows-chat-sidebar-placeholder.js
live/paid-calls-bookings-placeholder.js
marketplace/interactive-inventory-environments-placeholder.js
messaging/messaging-shell-placeholder.js
money/earnings-vault-placeholder.js
money/top-up-payment-options-placeholder.js
notifications/notifications-placeholder.js
profile/profile-placeholder.js
progress/feature-progress-dashboard-placeholder.js
rolodex/rolodex-contact-cards-placeholder.js
search/search-filter-placeholder.js
settings/settings-placeholder.js
smm/smm-command-center-placeholder.js
styling/styling-marketplace-placeholder.js
uploads/file-upload-placeholder.js
```

## Registry And Dashboard Screens

```text
plugins/backend-task-dashboard-placeholder.js
plugins/platform-plugin-dashboard-placeholder.js
plugins/platform-plugin-detail-placeholder.js
plugins/plugin-group-summary-placeholder.js
```

These cover:

```text
Feature progress registry
Plugin registry
Plugin detail view
Plugin group summaries
Backend task dashboard
Per-plugin next-task rules
Copy/export report controls
```

## Shared UI

```text
ui/button.js
ui/card.js
ui/form-field.js
ui/modal.js
```

## Progress

```text
Feature folder index                 [##########] 100%
Plugin-specific screens              [##########] 100%
Registry dashboards                  [##########] 100%
Folder README cleanup                [##########] 100%
Feature vs plugin rule captured      [##########] 100%
Plugin bridge retirement plan        [######----]  60%
Backend/API/database wiring          [####------]  40%
Expo/app runtime merge               [----------]   0%
```

## Merge-First Rule

```text
placeholder screen
  -> visible scaffold route
  -> real app route/module
  -> backend/API contract
  -> database schema
  -> admin/control-centre wiring
  -> README/progress update
```

## Maintenance Rule

When adding a new feature module:

1. Add it to this index.
2. Update the specific feature folder README.
3. If it should become reusable or installable, put the plugin implementation under `frontend/plugins/` and leave only a thin route/import bridge here when needed.
4. Keep pending backend/database/admin work visible until the real implementation exists.
