# Mistress-X Frontend Route Map

Branch: `feature/abacus-ai-build`

This route map documents every visible screen currently mounted by the plain frontend scaffold in:

```text
frontend/index.html
frontend/index.js
```

The current scaffold uses button/sidebar navigation through `setScreen(...)`. These routes are not yet real Expo/app routes, but this map defines what they should become when merged into the real app runtime.

---

# 1. Main Scaffold Routes

| Route Key | Visible Label | Current Factory | Purpose | Runtime Merge Status |
|---|---|---|---|---|
| `/dashboard` | Dashboard | `createDashboardHome()` | Main feature journey dashboard with progress cards and plugin group summaries | Pending real app route |
| `/progress` | Journey Progress | `createFeatureProgressDashboardPlaceholder()` | Registry-driven progress dashboard with filters and copy/export | Pending real app route |
| `/backend-tasks` | Backend Tasks | `createBackendTaskDashboardPlaceholder()` | Universal backend/database/admin/safety task queue | Pending real app route |
| `/plugins` | Plugin Registry | `createPlatformPluginDashboardPlaceholder()` | Registry-driven plugin browser with filters | Pending real app route |
| `/plugins/:pluginId` | Plugin Detail | `createPlatformPluginDetailPlaceholder()` | Plugin metadata, status, task list, dependencies, routes, docs | Pending real app route |

---

# 2. Money Routes

| Route Key | Visible Label | Current Factory | Entry Points | Runtime Merge Status |
|---|---|---|---|---|
| `/money/top-up` | Top-Up Payment Options | `createTopUpPaymentOptionsPlaceholder()` | Sidebar, top action, Dashboard, Money plugin detail | Pending real app route |
| `/money/earnings-vault` | Earnings Vault | `createEarningsVaultPlaceholder()` | Sidebar, top action, Dashboard, Money plugin detail | Pending real app route |

## Money route notes

```text
Top-Up Payment Options = money in
Earnings Vault = money out
Both need wallet ledger, payment/payout provider wiring, admin queues, audit logs, and database schemas.
```

---

# 3. Content + Live Routes

| Route Key | Visible Label | Current Factory | Entry Points | Runtime Merge Status |
|---|---|---|---|---|
| `/content/ppv-library` | PPV Content Library | `createPpvContentLibraryPlaceholder()` | Sidebar, top action, Dashboard, Content plugin detail | Pending real app route |
| `/live/shows` | Live Shows + Chat Sidebar | `createLiveShowsChatSidebarPlaceholder()` | Sidebar, top action, Dashboard, Live plugin detail | Pending real app route |
| `/live/paid-calls` | Paid Calls + Bookings | `createPaidCallsBookingsPlaceholder()` | Sidebar, top action, Dashboard, Live plugin detail | Pending real app route |

## Content/live route notes

```text
PPV handles paid media unlocks.
Live Shows handles rooms, chat, tickets, gifts, paid requests, and replays.
Paid Calls handles timed video/audio/text/screen-share sessions, calendar slots, timers, and extensions.
```

---

# 4. Collectibles + Identity Routes

| Route Key | Visible Label | Current Factory | Entry Points | Runtime Merge Status |
|---|---|---|---|---|
| `/collectibles/stickers` | Sticker Collector System | `createStickerCollectorSystemPlaceholder()` | Sidebar, top action, Dashboard, Collectibles plugin detail | Pending real app route |
| `/rolodex/cards` | Rolodex + Contact Cards | `createRolodexContactCardsPlaceholder()` | Sidebar, top action, Dashboard, Rolodex plugin detail | Pending real app route |
| `/badges` | Badge, Awards + Trophy System | `createBadgeAwardsTrophySystemPlaceholder()` | Sidebar, top action, Dashboard, Badges plugin detail | Pending real app route |

## Collectibles/identity route notes

```text
Stickers handle creation, albums, ownership, monthly drops, and matching physical-item stickers.
Rolodex handles Sub cards, Mistress notes, contracts, awards, private groups, and card expansion.
Badges handle verification, trust, achievements, trophies, annual awards, profile display, and social proof.
```

---

# 5. Marketplace + Operations Routes

| Route Key | Visible Label | Current Factory | Entry Points | Runtime Merge Status |
|---|---|---|---|---|
| `/marketplace/inventory` | Interactive Inventory Environments | `createInteractiveInventoryEnvironmentsPlaceholder()` | Sidebar, top action, Dashboard, Marketplace plugin detail | Pending real app route |
| `/smm/command-center` | SMM Command Center | `createSmmCommandCenterPlaceholder()` | Sidebar, top action, Dashboard, SMM plugin detail | Pending real app route |
| `/admin/command-centre` | Headmistress Command Centre | `createHeadmistressCommandCentrePlaceholder()` | Sidebar, top action, Dashboard, Admin plugin detail | Pending real app route |
| `/compliance/shield` | Compliance Shield | `createComplianceShieldPlaceholder()` | Sidebar, top action, Dashboard, Compliance plugin detail | Pending real app route |

## Marketplace/operations route notes

```text
Inventory handles Vending Machine, Laundry Hamper, Mystery Box, Private Vault, drops, orders, fulfilment, and compliance review.
SMM handles multi-site linking, OAuth/API tokens, content distribution, Blogger/SEO, inboxes, suppliers, disputes, ad revenue, and analytics.
Headmistress Command Centre handles moderation, approvals, payouts, plugin controls, reports, queues, and audit actions.
Compliance Shield handles age gate, consent ledger, marketplace restrictions, payment/content review, safety queues, policy rules, and audit logs.
```

---

# 6. Supporting Placeholder Routes

| Route Key | Visible Label | Current Factory | Purpose | Runtime Merge Status |
|---|---|---|---|---|
| `/profile` | Profile | `createProfilePlaceholder()` | User/profile system placeholder | Pending real app route |
| `/admin/basic` | Headmistress | `createAdminPanelPlaceholder()` | Older admin panel placeholder | Pending merge/replace with Command Centre |
| `/marketplace` | Marketplace | `createProductGridPlaceholder()` | Product grid/catalog placeholder | Pending merge with Inventory route |
| `/messages` | Messages | `createMessagingShellPlaceholder()` | Messaging shell placeholder | Pending real app route |
| `/notifications` | Notifications | `createNotificationsPlaceholder()` | Notification centre placeholder | Pending real app route |
| `/styling` | Styling Packs | `createStylingMarketplacePlaceholder()` | Styling add-on pack marketplace placeholder | Pending real app route |
| `/uploads` | Uploads | `createFileUploadPlaceholder()` | File upload/asset placeholder | Pending real app route |
| `/settings` | Settings | `createSettingsPlaceholder()` | Settings/theme/accessibility placeholder | Pending real app route |
| `/search` | Search Filters | `createSearchFilterPlaceholder()` | Search/filter control placeholder used inside Dashboard | Pending real app route/component |

---

# 7. Plugin Group Filter Routes

These are logical filtered routes. The current scaffold passes `initialFilter` into the Plugin Registry and Backend Tasks dashboard.

## Plugin Registry filters

```text
/plugins?filter=all
/plugins?filter=money
/plugins?filter=content
/plugins?filter=live
/plugins?filter=marketplace
/plugins?filter=collectibles
/plugins?filter=rolodex
/plugins?filter=badges
/plugins?filter=styling
/plugins?filter=smm
/plugins?filter=admin
/plugins?filter=compliance
/plugins?filter=backend
/plugins?filter=safety
```

## Backend Task filters

```text
/backend-tasks?filter=all
/backend-tasks?filter=backend
/backend-tasks?filter=database
/backend-tasks?filter=admin
/backend-tasks?filter=safety
/backend-tasks?filter=money
/backend-tasks?filter=content
/backend-tasks?filter=live
/backend-tasks?filter=marketplace
/backend-tasks?filter=collectibles
/backend-tasks?filter=rolodex
/backend-tasks?filter=badges
/backend-tasks?filter=styling
/backend-tasks?filter=smm
/backend-tasks?filter=compliance
```

---

# 8. Navigation Entry Points

## Dashboard hero buttons

```text
Open Journey Progress
Open Compliance
Open Command Centre
Open SMM
Open Inventory
Open Badges
Open Rolodex
Open Stickers
Open Paid Calls
Open Live
Open PPV Library
Open Top-Up
Open Earnings Vault
Open Backend Tasks
Open Plugin Registry
Open Styling Packs
Open Uploads
```

## Sidebar items

```text
Dashboard
Journey Progress
Compliance
Command Centre
SMM Command
Inventory
Badges
Rolodex
Stickers
Paid Calls
Live Shows
PPV Library
Top-Up
Earnings Vault
Backend Tasks
Plugin Registry
Profile
Headmistress
Marketplace
Messages
Notifications
Styling Packs
Uploads
Settings
```

## Top action buttons

```text
Progress
Compliance
Command
SMM
Inventory
Badges
Rolodex
Stickers
Calls
Live
PPV
Top-Up
Vault
Backend
Plugins
Brand Assets
```

---

# 9. Runtime Merge Checklist

```text
[ ] Confirm actual app runtime/router structure
[ ] Decide final route naming conventions
[ ] Convert plain JS factories into app components/screens where needed
[ ] Replace temporary setScreen navigation with real navigation
[ ] Preserve group-filtered plugin registry route params
[ ] Preserve group-filtered backend task route params
[ ] Keep plugin detail back-filter memory
[ ] Wire auth/role permissions for Mistress/Sub/Headmistress/admin
[ ] Wire backend API contracts
[ ] Wire database schemas
[ ] Update README/progress docs after merge
```

---

# 10. Progress

```text
Route map documentation              ██████████ 100%
Visible screen inventory             ██████████ 100%
Plugin route placeholders             ██████████ 100%
Filtered logical routes               ██████████ 100%
Runtime app route merge               ░░░░░░░░░░ pending
Backend/API/database routing          ░░░░░░░░░░ pending
```
