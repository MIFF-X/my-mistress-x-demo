# Sub Features

Sub-owned role surfaces for profile identity, service access, redemption,
achievements, relationship-safe management, and Sub cards.

## Modules

- `sub-dashboard.js` - Sub landing panel for messages, live rooms, bookings, and payments.
- `sub-profile.js` - Badge, identity tag, public stat, and profile summary helpers.
- `sub-management.js` - Privacy, relationship, and economy control lanes.
- `sub-service-board.js` - Viewer-safe service entry cards.
- `sub-redemption.js` - Reward and perk redemption cards.
- `sub-achievements.js` - Devotion, trust, and collector achievement summaries.
- `sub-card.js` - Compact Sub profile card and card-list factories.

## Boundary

These files stay in `frontend/features/sub` because they are Sub role
experience surfaces. Plugin source modules for obedience trackers,
leaderboards, and installable Sub extensions belong under `frontend/plugins`.
