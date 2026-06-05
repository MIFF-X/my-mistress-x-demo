# Mistress-X Frontend Scaffold

Branch: `feature/abacus-ai-build`

This frontend scaffold is now visible and runnable through:

```text
frontend/index.html
frontend/index.js
```

## What this entry mounts

```text
Dashboard
Journey Progress
Backend Tasks
Plugin Registry
Plugin Detail View
Top-Up Payment Options
Earnings Vault
PPV Content Library
Live Shows + Chat Sidebar
Paid Calls + Bookings
Sticker Collector System
Rolodex + Contact Cards
Badge, Awards + Trophy System
Interactive Inventory Environments
SMM Command Center
Headmistress Command Centre
Compliance Shield
Profile
Headmistress / Admin
Marketplace
Messages
Notifications
Styling Packs
Uploads
Settings
```

## Core scaffold files

```text
frontend/styles/tokens.css
frontend/styles/base.css
frontend/layouts/app-shell.js
frontend/features/ui/button.js
frontend/features/ui/card.js
frontend/features/ui/modal.js
frontend/features/ui/form-field.js
```

## Registry-driven dashboards

```text
frontend/features/progress/feature-progress-registry.js
frontend/features/progress/feature-progress-dashboard-placeholder.js
frontend/plugins/registry/platform-plugin-types.js
frontend/plugins/registry/platform-plugin-registry.js
frontend/plugins/registry/platform-plugin-dashboard-placeholder.js
frontend/plugins/registry/platform-plugin-detail-placeholder.js
frontend/plugins/registry/platform-plugin-next-tasks.js
frontend/plugins/registry/backend-task-dashboard-placeholder.js
frontend/plugins/registry/plugin-group-summary-placeholder.js
```

## Documentation now linked to scaffold

```text
frontend/ROUTE_MAP.md
backend/src/modules/README.md
backend/src/modules/money/README.md
backend/src/modules/content-live/README.md
backend/src/modules/collectibles-identity/README.md
backend/src/modules/marketplace-smm/README.md
backend/src/modules/admin-compliance/README.md
docs/backend-api-contracts/README.md
docs/backend-api-contracts/money-api-contract.md
docs/backend-api-contracts/content-live-api-contract.md
docs/backend-api-contracts/collectibles-identity-api-contract.md
docs/backend-api-contracts/marketplace-smm-api-contract.md
docs/backend-api-contracts/admin-compliance-api-contract.md
docs/database-schema-plans/README.md
docs/database-schema-plans/money-schema-plan.md
docs/database-schema-plans/content-live-schema-plan.md
docs/database-schema-plans/collectibles-identity-schema-plan.md
docs/database-schema-plans/marketplace-smm-schema-plan.md
docs/database-schema-plans/admin-compliance-schema-plan.md
```

## Backend scaffold modules now matching frontend screens

```text
Money screens -> backend/src/modules/money/
Content + Live screens -> backend/src/modules/content-live/
Collectibles / Rolodex / Badges screens -> backend/src/modules/collectibles-identity/
Marketplace / SMM screens -> backend/src/modules/marketplace-smm/
Admin / Compliance screens -> backend/src/modules/admin-compliance/
```

## Dashboard features now available

### Journey Progress

```text
All / Core / Plugins / Blocked / Done / Needs Review filters
Plugin-derived progress entries
Average progress and plugin average stats
Copy Current Filter
Copy Full Progress
Manual export textarea
```

### Plugin Registry

```text
All / Money / Content / Live / Marketplace / Collectibles / Rolodex / Badges / Styling / SMM / Admin / Compliance filters
Backend Needed filter
Safety Review filter
Plugin detail view
Plugin-specific action buttons
Dependencies, routes, docs, visibility, safety notes
Frontend/backend/database/admin status cards
Per-plugin next task lists
```

### Backend Tasks

```text
All / Backend / Database / Admin / Safety filters
Automatic plugin category filters
Aggregated next tasks from every registered plugin
Copy Current Filter
Copy All Tasks
Manual export textarea
Group summary links into filtered backend queues
```

## Plugin-specific screens now visible

```text
frontend/features/money/top-up-payment-options-placeholder.js
frontend/features/money/earnings-vault-placeholder.js
frontend/features/content/ppv-content-library-placeholder.js
frontend/features/live/live-shows-chat-sidebar-placeholder.js
frontend/features/live/paid-calls-bookings-placeholder.js
frontend/features/collectibles/sticker-collector-system-placeholder.js
frontend/features/rolodex/rolodex-contact-cards-placeholder.js
frontend/features/badges/badge-awards-trophy-system-placeholder.js
frontend/features/marketplace/interactive-inventory-environments-placeholder.js
frontend/features/smm/smm-command-center-placeholder.js
frontend/features/admin/headmistress-command-centre-placeholder.js
frontend/features/compliance/compliance-shield-placeholder.js
```

## Plugin-specific screen coverage

### Money

```text
Top-Up Payment Options
Earnings Vault
Card / Google Pay / Apple Pay / PayID / manual verification placeholders
Bank / PayID / Stripe Connect / adult-friendly processor / manual payout placeholders
Ledger and reserve flow notes
Backend module: backend/src/modules/money/
API contract: docs/backend-api-contracts/money-api-contract.md
Schema plan: docs/database-schema-plans/money-schema-plan.md
```

### Content + Live

```text
PPV Content Library
Live Shows + Chat Sidebar
Paid Calls + Bookings
Timed viewing, buy-to-keep, subscription bundles, vaulted drops
Public/private/locked/access-code rooms
Watch With Mistress and replay/archive rooms
Video/audio/text calls, consent screen share, calendar slots, extensions
Backend module: backend/src/modules/content-live/
API contract: docs/backend-api-contracts/content-live-api-contract.md
Schema plan: docs/database-schema-plans/content-live-schema-plan.md
```

### Collectibles + Identity

```text
Sticker Collector System
Rolodex + Contact Cards
Badge, Awards + Trophy System
Matching physical-item digital stickers
Sticker albums, monthly drops, completion rewards
Sub cards, Keeper cards, contract cards, MX award cards
Verification, trust, viewing, achievement, annual award, trophy, and casual sticker awards
Backend module: backend/src/modules/collectibles-identity/
API contract: docs/backend-api-contracts/collectibles-identity-api-contract.md
Schema plan: docs/database-schema-plans/collectibles-identity-schema-plan.md
```

### Marketplace + Operations

```text
Interactive Inventory Environments
SMM Command Center
Headmistress Command Centre
Compliance Shield
Vending Machine, Laundry Hamper, Mystery Box, Private Vault, limited drops, custom orders
Website linking, OAuth/API placeholder, social posting, Blogger/SEO, inbox, supplier disputes, ad revenue, analytics
Moderation queues, approval centre, money oversight, plugin controls, reports, support/disputes
Age gate, consent ledger, marketplace restrictions, payment compliance, content review, audit logs, policy rules
Backend modules: backend/src/modules/marketplace-smm/ and backend/src/modules/admin-compliance/
API contracts: docs/backend-api-contracts/marketplace-smm-api-contract.md and docs/backend-api-contracts/admin-compliance-api-contract.md
Schema plans: docs/database-schema-plans/marketplace-smm-schema-plan.md and docs/database-schema-plans/admin-compliance-schema-plan.md
```

## Placeholder feature screens

```text
frontend/features/profile/profile-placeholder.js
frontend/features/admin/admin-panel-placeholder.js
frontend/features/catalog/product-grid-placeholder.js
frontend/features/search/search-filter-placeholder.js
frontend/features/messaging/messaging-shell-placeholder.js
frontend/features/notifications/notifications-placeholder.js
frontend/features/uploads/file-upload-placeholder.js
frontend/features/settings/settings-placeholder.js
```

## Styling plugin system

```text
frontend/features/styling/styling-pack-types.js
frontend/features/styling/styling-pack-registry.js
frontend/features/styling/styling-marketplace-placeholder.js
```

## Asset folders

```text
frontend/assets/brand/
frontend/assets/favicon/
frontend/assets/icons/
frontend/assets/badges/
frontend/assets/gif-decks/
frontend/assets/styling-packs/
```

## How to test locally

Open this file directly in a browser:

```text
frontend/index.html
```

Or serve the repo with any static server from the project root, then open:

```text
/frontend/index.html
```

Example using Python from the repo root:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080/frontend/index.html
```

## Current rule

The scaffold is not meant to remain a hidden side layer. Each placeholder must be merged into the real app feature module as the current app branch becomes clearer.

## Merge-first workflow

```text
scaffold component
  ↓
visible frontend page
  ↓
real app module / route
  ↓
backend/API/database wiring
  ↓
README/progress update
```

## Progress

```text
Visible web entry                  ██████████ 100%
Shared UI scaffold                 ██████████ 100%
Journey Progress dashboard         ██████████ 100%
Plugin Registry dashboard          ██████████ 100%
Plugin detail view                 ██████████ 100%
Plugin group summaries             ██████████ 100%
Backend Tasks dashboard            ██████████ 100%
Copy/export controls               ██████████ 100%
Money plugin screens               ██████████ 100%
Content plugin screens             ██████████ 100%
Live plugin screens                ██████████ 100%
Collectibles plugin screens        ██████████ 100%
Rolodex plugin screen              ██████████ 100%
Badges plugin screen               ██████████ 100%
Marketplace plugin screen          ██████████ 100%
SMM plugin screen                  ██████████ 100%
Admin plugin screen                ██████████ 100%
Compliance plugin screen           ██████████ 100%
Route map docs                     ██████████ 100%
Backend API contract docs          ██████████ 100%
Database schema plan docs          ██████████ 100%
Backend module scaffolds           ██████████ 100%
Styling plugin registry            ██████████ 100%
Brand asset folders                ██████████ 100%
Favicon SVG/manifest wiring        ██████████ 100%
Binary PNG/ICO upload              ░░░░░░░░░░ pending
Expo/app runtime merge             ░░░░░░░░░░ pending app entry audit
Real backend implementation        ██░░░░░░░░ 20% scaffolded, not production-wired
Actual Prisma migrations           ░░░░░░░░░░ pending
```
