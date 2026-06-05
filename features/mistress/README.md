# Mistress Features

Role-owned creator surfaces for the Mistress dashboard, profile studio,
relationship management, feed, positions, rewards, and private Sub context.

## Modules

- `mistress-dashboard.js` - Main creator control panel for messages, live rooms, bookings, monetisation, payments, and punishments.
- `mistress-profile.js` - Profile studio, public channel, category, visibility, and creator-stat panel helpers.
- `mistress-management.js` - Relationship, follow-up, booking, privacy, and economy control lanes.
- `mistress-card.js` - Compact Mistress profile card and card-list factories.
- `mistress-feed.js` - Creator activity and audience-safe feed summary helpers.
- `mistress-positions.js` - Position, title-holder, league, and leaderboard lane cards.
- `mistress-rewards.js` - Reward, recognition, wishlist, tribute, and perk lane cards.
- `marketplace/nft-marketplace/` - Mistress-owned MX NFT Marketplace screen used by the plugin registry route map.
- `content-vault/` - Mistress-owned Content Vault NFT publisher screen for sending ready vault items into review.

## Boundary

These files stay in `frontend/features/mistress` because they are role-owned
Mistress creator surfaces. Installable plugin source modules for PPV, wheels,
punishments, blogger/SEO, games, and add-on experiences belong under
`frontend/plugins`, with feature files acting only as screens or thin bridges
when needed. Route-backed creator screens such as the MX NFT Marketplace and
Content Vault NFT publisher stay here because they are role-owned dashboard
surfaces, not reusable plugin source buckets.
