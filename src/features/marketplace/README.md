<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:2B0F3A,45:8B1E5A,100:D4AF37&height=140&section=header&text=Marketplace%20Worlds&fontSize=36&fontColor=FFFFFF&animation=scaleIn&fontAlignY=35&desc=Vending%20Machine%20%7C%20Laundry%20Hamper%20%7C%20Mystery%20Box%20%7C%20Seller%20Orders&descAlignY=58&descSize=13" alt="Animated Marketplace Worlds README title" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Orbitron&size=18&duration=2800&pause=900&color=D4AF37&center=true&vCenter=true&width=760&lines=Backend-driven+marketplace+world+policies;Creator+inventory+and+seller+order+management;Seller+notes+tracking+and+fulfilment+controls" alt="Animated marketplace typing banner" />
</p>

# Marketplace / Inventory Worlds Feature

Frontend folder:

```text
frontend/src/features/marketplace
```

Primary components:

```text
CollectorEconomyScreen.tsx
collectorEconomyModel.ts
InventoryPluginsScreen.tsx
PluginMarketplaceScreen.tsx
PluginOperationsPanel.tsx
MarketplaceWorldSelector.tsx
MarketplaceProductCreateForm.tsx
MarketplaceInventoryScreen.tsx
MarketplaceInventoryProductCard.tsx
MarketplaceOrderFulfilmentControl.tsx
MarketplaceSellerOrdersScreen.tsx
```

This folder owns the app-side marketplace inventory worlds, including Vending Machine, Laundry Hamper, Mystery Box, creator inventory management UI, creator seller-order fulfilment UI, and collector economy planning.

---

## Current architecture correction

Important correction:

```text
Marketplace PRIVATE_VAULT = legacy restricted-listing only.
True Sub Vault / Verification Vault / Loyalty Vault = separate Sub-side plugin/module.
Little Black Book = Sub-side mirror of Mistress Rolodex.
```

Do not build Sub-side credential/evidence vault features into marketplace product inventory.

The real future Sub Vault should be consent-based, revocable, audited, and verification-focused. It should not store raw passwords/logins or enable coercive blackmail automation.

---

## Purpose

The Marketplace feature is the product/inventory layer of Mistress-X. It is designed as a set of plugin worlds rather than one plain store.

Current marketplace worlds:

```text
STANDARD
VENDING_MACHINE
LAUNDRY_HAMPER
MYSTERY_BOX
PRIVATE_VAULT legacy restricted-listing only
```

Default UI-facing worlds:

```text
Standard Marketplace
Vending Machine
Laundry Hamper
Mystery Box
```

The frontend `MarketplaceWorldSelector` hides legacy marketplace `PRIVATE_VAULT` by default.

---

## CollectorEconomyScreen

File:

```text
CollectorEconomyScreen.tsx
```

Purpose:

```text
Coordinator surface for marketplace worlds, order states, buyer/seller handoff, fulfilment, disputes, refunds, and item-matched rewards.
```

Dashboard route:

```text
collectorEconomy
```

Worlds represented:

```text
Vending Machine
Laundry Hamper
Personal Items
PPV / Content
Style Packs
Sticker Rewards
Custom Orders
```

Order states represented:

```text
Draft
Pending Approval
Awaiting Payment
Paid
Preparing
Fulfilled
Disputed
Refunded
```

Reward rules represented:

```text
Item-matched sticker unlocks
World completion badges
Custom order keepsakes
Content pack rewards
```

Still pending production wiring:

```text
persisted custom-order quotes
dispute/refund workflow
sticker reward rule engine
reward revocation on refunds
buyer display privacy controls
sensitive physical goods policy review
```

---

## Connected backend API

Frontend API client:

```text
frontend/src/api/marketplaceApi.ts
frontend/src/api/pluginsApi.ts
```

Backend module:

```text
backend/src/modules/marketplace
```

Main backend routes used by this feature:

```text
GET   /api/marketplace/world-policies
GET   /api/marketplace/products
GET   /api/marketplace/products/world/:world
GET   /api/marketplace/orders/seller
GET   /api/marketplace/orders/seller/export.csv
GET   /api/marketplace/orders/seller/export-batches
GET   /api/marketplace/orders/seller/processor-reconciliation
GET   /api/marketplace/orders/seller/fulfilment-events
GET   /api/marketplace/order/:orderId/timeline
GET   /api/marketplace/order/:orderId/receipt
GET   /api/marketplace/analytics/fulfilment
GET   /api/marketplace/fulfilment-sla-policy
POST  /api/marketplace/product
POST  /api/marketplace/orders/seller/export-batches
PATCH /api/marketplace/product/:productId
PATCH /api/marketplace/order/:orderId/fulfilment
PATCH /api/marketplace/fulfilment-sla-policy
POST  /api/marketplace/purchase
POST  /api/marketplace/approval-request
POST  /api/marketplace/approval-request/:orderId/approve
POST  /api/marketplace/approval-request/:orderId/decline
POST  /api/marketplace/approval-order/:orderId/purchase
GET   /api/marketplace/approval-orders/mine
```

---

## Plugin Marketplace Operations

File:

```text
PluginOperationsPanel.tsx
```

Purpose:

```text
Shows the plugin operations layer for create, add, install, update, configure, rate, and remove.
Shows manifest validation requirements for identity, entry, permissions, media, docs, tests, billing, and security.
Shows category-page scaffolds for live, monetization, chat, monitoring, rewards, growth, and social plugins.
Shows live reload event contracts for installed, updated, disabled, and suggestion-created events.
```

Dashboard route:

```text
pluginMarketplace
```

The dashboard route now opens the real plugin marketplace screen instead of the placeholder access notice.

Still pending production wiring:

```text
persisted manifest validation results
release/version records
ratings and reviews
reload-event dispatch
install/remove audit trails
uploaded plugin scan results
license/security approval workflow
```

---

## Marketplace world policy source of truth

Marketplace world rules are exposed by:

```text
GET /api/marketplace/world-policies
```

Frontend type:

```text
MarketplaceWorldPolicy
```

Policy fields:

```text
world
label
description
defaultVisibility
defaultRevealMode
requiresApproval
supportsPhysicalStock
supportsMysteryReveal
supportsManualApproval
isLegacyRestrictedListing
architectureNote
```

---

## MarketplaceInventoryScreen

File:

```text
MarketplaceInventoryScreen.tsx
```

Purpose:

```text
Page-style wrapper for inventory-world management.
Includes MarketplaceProductCreateForm.
Includes MarketplaceWorldSelector.
Lists seller products by selected world, including seller-owned private restricted listings.
Supports refresh flow.
Renders editable MarketplaceInventoryProductCard items.
```

Product cards support:

```text
title edit
description edit
price edit
stock edit
+1 Stock quick reload
+5 Stock quick reload
save/cancel
```

---

## MarketplaceSellerOrdersScreen

File:

```text
MarketplaceSellerOrdersScreen.tsx
```

Purpose:

```text
Creator-facing order-management screen.
Loads seller orders through listMarketplaceSellerOrders().
Loads order timelines through listMarketplaceOrderTimeline().
Shows buyer, seller, product, price, status, world, reveal mode, approval-flow badge, and order id.
Filters seller orders by status, marketplace world, and updated date range.
Embeds MarketplaceOrderFulfilmentControl per order.
Shows order lifecycle cards for created, purchase, approval, fulfilment, notes, and current state.
Updates local order status after fulfilment save.
```

Dashboard route:

```text
marketplaceOrders
```

Dashboard card:

```text
Marketplace Orders
Fulfil sales, update status, tracking & seller notes
```

Visible only to:

```text
MISTRESS
HEADMISTRESS
ADMIN
```

---

## MarketplaceOrderFulfilmentControl

File:

```text
MarketplaceOrderFulfilmentControl.tsx
```

Purpose:

```text
Reusable order fulfilment panel for seller/admin order management.
Calls updateMarketplaceOrderFulfilment().
Sends status, sellerNote, fulfilmentNote, trackingReference, trackingUrl, and internalNote.
```

Supported status buttons:

```text
PROCESSING
PACKED
SHIPPED
READY_FOR_PICKUP
DELIVERED
CANCELLED
REFUNDED
```

Seller note behavior:

```text
sellerNote is the buyer-facing note from seller.
fulfilmentNote is the general fulfilment note.
internalNote is seller/admin-facing context and should not be presented as buyer copy unless deliberately exposed later.
```

---

## InventoryPluginsScreen

File:

```text
InventoryPluginsScreen.tsx
```

Purpose:

```text
Buyer-facing and creator-capable plugin world surface for Vending Machine, Laundry Hamper, Mystery Box, and Restricted Listings.
Loads world-specific products, approval orders, and buyer order history.
Creator mode can create plugin-world listings with world metadata plus cover, gallery, preview, and alt-text media metadata.
Product cards render cover media and Mystery Box reveal prefers preview media, gallery media, then cover media.
```

---

## World policy defaults

```text
STANDARD
- PUBLIC
- IMMEDIATE
- approval off

VENDING_MACHINE
- PUBLIC
- IMMEDIATE
- approval off
- fast-buy stock drops

LAUNDRY_HAMPER
- PUBLIC
- AFTER_PURCHASE
- approval off
- fulfilment notes and stock handling

MYSTERY_BOX
- PUBLIC
- AFTER_PURCHASE
- approval off
- mystery reveal supported
- immediate reveal blocked

PRIVATE_VAULT legacy restricted listing
- PRIVATE
- MANUAL_APPROVAL
- approval on
- hidden by default in buyer-facing frontend selectors
- included by MarketplaceInventoryScreen for seller-only restricted-listing management
- UI-facing label: Restricted Listing / Restricted Listings
- not the true Sub Vault
```

---

## Wallet behaviour

Normal product purchases and approved-order purchases should be charged by the backend marketplace service through the wallet ledger.

The frontend should not directly alter balances. It calls the marketplace purchase/approval endpoints and lets the backend act as the financial source of truth.

---

## Dashboard behavior

```text
Marketplace Inventory Worlds
- creator/admin only
- create products
- edit products
- reload stock

Marketplace Orders
- creator/admin only
- view seller order queue
- update fulfilment status
- add seller note
- add tracking details
- registered in the dashboard widget registry as `marketplace.seller-orders`
- mapped to the Mistress Dashboard Sales Fulfilment service contract
- registered in the Magnetic feature registry as `marketplace-seller-orders`
- load store receipts with 70/30 split and CSV statement text
- show refund, cancellation, and chargeback receipt adjustments with adjusted net receipt amount
- show fulfilment health with open queue, in-progress count, exception count, gross open credits, oldest open order, status breakdown, SLA watch alerts, and active SLA policy chips
- show SLA policy rules and let Headmistress/Admin roles tune thresholds, severity, pause state, and recommended action text
- show per-world SLA override chips and recent SLA policy audit notes in the seller/admin dashboard
- read marketplace SLA policy persistence mode so the dashboard can distinguish database-backed policy from local scaffold fallback
- let Headmistress/Admin roles dry-run and deliver marketplace SLA alert jobs from the seller/admin dashboard
- show marketplace SLA alert scheduler readiness, escalation roles, delivery persistence mode, and recent run history for Headmistress/Admin roles
- show production scheduler monitor state, recent scheduler failures, provider webhook readiness, and latest provider dispatch state for marketplace SLA alerts
- retry failed marketplace SLA provider webhook dispatch receipts from the seller/admin dashboard
- show provider webhook retry queue readiness, exponential-backoff config, due retry runner, and dead-letter review action for marketplace SLA alerts
- show provider webhook retry worker status, latest worker run, and provider incident ticket handoff details for dead-letter SLA alerts
- show provider incident API adapter readiness, callback-secret state, ticket status, provider dispatch result, and latest ticket sync timestamp
- show provider incident config-check gaps and let Headmistress/Admin users send test tickets or close incident tickets from the seller/admin dashboard
- show provider incident install/OAuth readiness, sandbox validation status, and field-mapping chips with a dry-run sandbox validation action
- expose the provider incident slice through the MX Magnetic backend feature contract registry for dashboard/plugin discovery
- show persisted fulfilment event log rows with status transitions, notes, tracking references, actor role, and order id
- show estimated processor reconciliation totals for receipt rows, including estimated fees, adjustment totals, and platform net after adjustments/fees
- export filtered seller store receipt CSV with show, download, copy, and share controls
- create draft store receipt export batches that preserve current filters, receipt totals, row counts, receipt numbers, and generated CSV text

Command Centre Store Review
- headmistress/admin only
- uses GET /api/admin/marketplace-worlds
- shows approval waits, payment waits, fulfilment queue rows, in-progress handoff, exceptions, gross paid credits under review, and loaded store receipt splits

Inventory Plugins
- buyer-facing flow
- browse, request approval, purchase
```

---

## Related docs

```text
docs/MARKETPLACE_INVENTORY_WORLDS_CHECKPOINT_2026-05-13.md
docs/PRIVATE_VAULT_ARCHITECTURE_CORRECTION_2026-05-13.md
docs/README_INDEX_MARKETPLACE_INVENTORY_WORLDS_ADDENDUM_2026-05-13.md
docs/README_COVERAGE_MARKETPLACE_INVENTORY_WORLDS_ADDENDUM_2026-05-13.md
docs/UNIVERSAL_WORKLOAD_MARKETPLACE_INVENTORY_WORLDS_ADDENDUM_2026-05-13.md
docs/LOCAL_VERIFICATION_MARKETPLACE_INVENTORY_WORLDS_CHECKPOINT_2026-05-13.md
README_MARKETPLACE_INVENTORY_WORLDS_STATUS_2026-05-13.md
```

---

## Local verification checklist

Latest local result, 2026-05-16:

```text
frontend npm.cmd run typecheck: pass.
backend npm.cmd run typecheck: pass.
backend npm.cmd run build: pass.
backend npm.cmd run test -- marketplace.service marketplace.controller marketplace-world.policy: pass, 3 suites, 54 tests.
backend npm.cmd run test -- chat.service ppv.service rolodex.service rolodex.controller: pass, 4 suites, 79 tests.
edit/update product support: locally verified.
stock reload +1/+5 controls: locally verified.
seller order filters by status/world/date: locally verified.
seller order status controls: locally verified.
marketplace analytics by world: locally verified.
product media metadata editor: locally verified.
```

Latest local result, 2026-05-20:

```text
frontend npm.cmd run typecheck: pass.
Marketplace Orders dashboard widget registry binding: locally verified.
Sales Fulfilment service contract: locally verified.
Magnetic marketplace seller-order contract: locally verified.
```

After pulling the branch, run:

```powershell
cd C:\Users\Guest1\MY-MISTRESS-X

git pull origin feature/abacus-ai-build

cd frontend
npm run typecheck

cd ../backend
npm run typecheck
npm run build
npm run test -- marketplace-world.policy marketplace.service marketplace.controller marketplace.fulfilment.service marketplace.seller-orders.service
```

---

## Still to polish later

```text
Marketplace analytics by world
Buyer-facing order history screen
Richer product images/media picker
Mystery Box reveal animation
Duplicate approval request prevention UX
Marketplace automated UI tests
Media/CDN storage provider
Separate Sub Vault / Verification Vault module
Little Black Book / Sub Rolodex mirror
```
