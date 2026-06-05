# Profile Feature

Status: scaffolded public showcase surface.

## Current Profile Surfaces

- Profile showcase card for display name, role label, badges, featured gifts, and featured stickers.
- Profile showcase now starts with a shared crown-style header language for Headmistress/Admin, Mistress, Sub, and member surfaces.
- Role-specific showcase action panels route to live, booking, PPV, earnings, Sub support, or admin-safe destinations through the dashboard shell when available.
- Dashboard-hosted showcases consume the saved UI Layout style-pack theme, applying the active pack accent and tags to the crown header and collector card.
- Public goal fund widget panel for active Mistress funds.
- Goal fund widgets filter by the displayed profile user id when one is available.
- Mini gift rail and per-fund contribution amount/message controls for public profile cards.

## Connected Routes

- `GET /api/goals/funds/public`
- `GET /api/gifts`
- `POST /api/goals/funds/:fundId/contribute`
- `POST /api/gifts/send`

## Still Needed

- Public profile route for viewing other Mistress profiles outside the current user dashboard.
- Featured gift and sticker inventory wiring from the real inventory endpoints.
- Profile taxonomy chips wired into the showcase once taxonomy persistence is complete.
- Dedicated public profile route should pass viewer role separately from profile-owner role for cross-role action filtering.
- Public routes should pass the resolved style-pack theme once they are no longer hosted by the dashboard shell.
