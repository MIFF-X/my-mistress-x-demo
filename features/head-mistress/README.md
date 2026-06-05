# Headmistress Features

Role-owned oversight modules for platform analytics, traffic, money, awards,
prize pools, risk heatmaps, and governed user controls.

## Modules

- `headmistress-dashboard.js` - Composes the marker-clean control dashboard.
- `analytics.js` - Platform KPI cards and analytics helpers.
- `traffic.js` - Public, My Gate, and external channel traffic oversight.
- `revenue.js` - Revenue split, payout, and marketplace shelf control lanes.
- `awards.js` - Awards and recognition review queue.
- `prize-pool.js` - Prize allocation and settlement guard list.
- `heatmaps.js` - Risk and demand heatmap summaries.
- `user-controls.js` - Member, moderation, and visibility control lanes.
- `command-centre/CommandCentreScreen.jsx` - Headmistress command-centre plugin screen mounted by the platform plugin screen registry.
- `compliance/ComplianceScreen.jsx` - Compliance Shield plugin screen mounted by the platform plugin screen registry.
- `nft-marketplace/AdminNftMarketplaceScreen.jsx` - NFT marketplace review queue screen.
- `nft-marketplace/AdminNftReserveScreen.jsx` - NFT reserve release/refund control screen.
- `smm/SmmDashboardScreen.jsx` - Headmistress SMM command screen.

## Boundary

These files stay in `frontend/features/head-mistress` because they are
role-owned Headmistress surfaces, not installable plugin source modules. Plugin
extensions should continue to live under `frontend/plugins`.
