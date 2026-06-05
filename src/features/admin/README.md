<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:12081F,45:4B1248,100:D4AF37&height=140&section=header&text=Headmistress%20Command%20Centre&fontSize=34&fontColor=FFFFFF&animation=fadeIn&fontAlignY=35&desc=Admin%20oversight%20%7C%20moderation%20%7C%20ledger%20%7C%20plugins%20%7C%20compliance&descAlignY=58&descSize=13" alt="Animated Headmistress Command Centre README title" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Orbitron&size=18&duration=2800&pause=900&color=D4AF37&center=true&vCenter=true&width=780&lines=Platform+oversight+for+Headmistress+and+Admin;Marketplace+approvals%2C+ledger%2C+plugins%2C+compliance;Command+Centre+for+systems-feeding-systems" alt="Animated admin typing banner" />
</p>

# Admin / Headmistress Command Centre Feature

Frontend folder:

```text
frontend/src/features/admin
```

Primary screens:

```text
AdminCommandCentreScreen.tsx
AdminAnalyticsStatusScreen.tsx
```

This folder owns the app-side Headmistress/Admin oversight surface for platform-wide monitoring, moderation, compliance, marketplace approvals, and system governance.

---

## Purpose

The Command Centre is the control-panel layer of Mistress-X. It gives Headmistress/Admin roles a single place to monitor connected systems and take platform actions.

The current version is a first-pass admin surface for:

```text
platform overview
users
wallet ledger
moderation
plugins
PPV
live shows
bookings
sticker packs
marketplace worlds
Private Vault approval queue
compliance/audit logs
plugin marketplace monetisation
plugin/addon suggestion review
admin analytics and system status
```

---

## Admin Analytics / System Status

`AdminAnalyticsStatusScreen.tsx` is the scaffold for the admin dashboard reference:

```text
project selector
date range filters
total conversations
active users
revenue
tokens used
conversation trends
top characters/content
subscription segments
API gateway / AI service / database / storage / websocket / payment processor status
recent operational logs
API key review rows
webhook delivery rows
Stripe provider readiness from live webhook health
admin navigation tiles for models, conversations, users, content, logs, keys, webhooks, and status
```

The current data is mostly local scaffold data. Stripe provider readiness now reads from the live admin webhook-health endpoint; production follow-up should add backend read models for analytics, persisted system events, API key audit history, broader webhook delivery logs, and provider health snapshots.

---

## Access rule

The dashboard should only mount this screen for:

```text
HEADMISTRESS
ADMIN
```

The backend admin routes should also remain JWT + role protected.

---

## Connected frontend API clients

Main admin API clients:

```text
frontend/src/api/adminApi.ts
frontend/src/api/adminCommandApi.ts
frontend/src/api/adminEconomyApi.ts
```

The Headmistress dashboard finance panel now consumes `adminEconomyApi.ts` for the Bank/Cash-In/Cash-Out contract: bank summary, reserve holds, payout health, provider readiness, top-up review rows, payout batch creation, and payout review decisions.

Marketplace approval actions are also called through:

```text
frontend/src/api/marketplaceApi.ts
```

---

## Connected backend modules/routes

Backend admin module:

```text
backend/src/modules/admin
```

Main admin routes used by this screen include:

```text
GET /api/admin/overview
GET /api/admin/users
GET /api/admin/ledger
GET /api/admin/moderation
GET /api/admin/plugins
GET /api/admin/ppv
GET /api/admin/live-shows
GET /api/admin/bookings
GET /api/admin/sticker-packs
GET /api/admin/marketplace-worlds
GET /api/admin/compliance
```

Plugin marketplace command routes:

```text
POST /api/admin/plugin-actions
PATCH /api/admin/plugin-actions/:pluginId/marketplace-settings
GET /api/admin/plugin-actions/suggestions
PATCH /api/admin/plugin-actions/suggestions/:suggestionId
```

Marketplace decision routes used inside Command Centre:

```text
POST /api/marketplace/approval-request/:orderId/approve
POST /api/marketplace/approval-request/:orderId/decline
```

---

## Current tabs

```text
Overview
Users
Ledger
Moderation
Plugins
PPV
Live Shows
Bookings
Sticker Packs
Marketplace Worlds
Compliance
```

---

## Overview tab

Shows platform count cards for key systems, including:

```text
total users
active users
Mistresses
Subs
wallet transactions
PPV items
live shows
paid call bookings
gifts
stickers
sticker packs
completed sticker packs
marketplace products
approval locked products
pending marketplace approvals
open moderation
```

Also shows:

```text
recent transactions
recent notifications
```

---

## Users tab

Shows user monitoring cards with:

```text
display name / username
email
role
status
adult verification state
wallet balance
joined date
```

---

## Ledger tab

Shows wallet transaction cards with:

```text
transaction type
direction
amount
platform amount
Mistress amount
sender
receiver
reason
created date
```

Wallet ledger remains the financial source of truth.

---

## Moderation tab

Shows moderation items with:

```text
title
priority
status
area
description
reporter
assigned user
```

This is the first-pass surface for future safety/compliance queues.

---

## Plugins tab

Shows platform plugin rows with:

```text
plugin name
area
status
description
entitlement count
```

This supports the wider plugin architecture for monetisation, live interactions, stickers, marketplace worlds, SMM, games, and future add-ons.

The dedicated Admin Plugin Command screen also includes:

```text
create plugin form
monetisation mode controls
full suite / pick plugin / addon license controls
base and lifetime credit pricing
calendar start/end limits
pick 3 and pick 8 + 20 addon bundle pricing
addon enable toggle
addon start/end availability limits
suggestion box and custom request toggles
admin-only plugin/addon suggestion review queue
```

---

## PPV tab

Shows PPV monitoring cards with:

```text
title
active/inactive state
access type
price
owner
unlock count
created date
```

PPV itself is managed in:

```text
frontend/src/features/ppv/PpvScreen.tsx
```

---

## Live Shows tab

Shows live show cards with:

```text
title
status
ticket price
host
loaded ticket count
chat enabled state
gifts enabled state
```

Live show user flow is managed in:

```text
frontend/src/features/live
```

---

## Bookings tab

Shows paid call booking records with:

```text
booking type
status
price
duration
Sub user
Host user
scheduled time
created time
notes
```

Booking user flow is managed in:

```text
frontend/src/features/bookings
```

---

## Sticker Packs tab

Shows sticker pack records with:

```text
pack title
active/inactive status
theme
price
creator
item count
progress row count
description
rarity labels
created date
```

Sticker user flow is managed in:

```text
frontend/src/features/stickers
```

---

## Marketplace Worlds tab

Shows marketplace system monitoring for world-based product plugins.

Summary cards show:

```text
product count by world
stock total by world
```

Marketplace listing cards show:

```text
title
world
price
stock
visibility
reveal mode
seller
orders loaded
approval requirement
description
```

Marketplace user flow is managed in:

```text
frontend/src/features/marketplace
```

---

## Seller Approval Queue

The Marketplace Worlds tab includes the richer approval queue for Private Vault/manual approval requests.

Filters:

```text
Filter by seller
Filter by world
```

Each filter chip shows counts.

Pending approval cards show:

```text
product title
status
price
pending age / waiting time
world
reveal mode
buyer
seller
seller queue note
requested date
Approve
Decline
```

Actions:

```text
Approve -> moves order to APPROVED_PENDING_PAYMENT
Decline -> moves order to DECLINED
```

After action, the screen refreshes:

```text
Marketplace Worlds
Overview counts
```

---

## Compliance tab

Shows compliance overview counts and recent audit logs.

Audit rows include:

```text
action
actor
target
created date
```

This is the first-pass foundation for the future compliance console.

---

## Local verification checklist

After pulling the branch, run:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run build

cd ../frontend
npm install
npm run typecheck
npm run web
```

Then manually test:

```text
1. Login as Headmistress/Admin.
2. Confirm Command Centre appears in dashboard.
3. Open each tab and refresh.
4. Confirm Overview counts load.
5. Confirm Users and Ledger load.
6. Confirm Bookings tab loads paid call records.
7. Confirm Sticker Packs tab loads pack records.
8. Confirm Marketplace Worlds tab loads product summaries.
9. Create a Private Vault approval request as Sub.
10. Return to Command Centre as Headmistress/Admin.
11. Filter Seller Approval Queue by seller and world.
12. Approve the request.
13. Confirm Overview pending count refreshes.
14. Repeat with a decline flow.
15. Confirm Compliance tab loads audit/compliance rows.
16. Open Admin Plugin Command.
17. Create a scaffolded plugin with marketplace settings.
18. Select a plugin and save freemium/fixed/subscription settings.
19. Toggle suggestion, custom request, addon enable, and addon date-window settings.
20. Review a plugin/addon suggestion into triaged, approved, planned, built, or declined.
```

---

## Still to polish later

```text
real table/grid layout for wider screens
search and filter controls for every tab
pagination for large datasets
seller-only approval queue outside admin
bulk moderation actions
admin notes/actions on users
exportable ledger reports
compliance evidence packs
role permissions matrix UI
automated admin endpoint tests
bulk bundle/addon editing
plugin revenue analytics cards
```
