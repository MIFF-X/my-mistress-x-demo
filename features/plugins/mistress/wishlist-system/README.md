# Wishlist System

Branch: `feature/abacus-ai-build`

Frontend surface:

```text
frontend/src/features/wishlist/WishlistSupportScreen.tsx
frontend/src/api/wishlistApi.ts
```

Current coverage:

```text
Mistress wishlist lookup
Creator item creation/removal
Buyer purchase action
Buyer reserve-interest action
Creator reservation inbox
Reservation counts on wishlist items
Command Centre reservation review summary
Command Centre cancel/expire reservation actions
Command Centre stale reservation sweep
Shared wishlist action-row buttons
```

Backend routes:

```text
GET  wishlist/items/mistress/:mistressId
POST wishlist/items/:itemId/reserve
GET  wishlist/reservations/mistress/:mistressId
GET  wishlist/admin/reservations
POST wishlist/admin/reservations/expire-stale
POST wishlist/admin/reservations/:reservationId/review
POST wishlist/items/:itemId/purchase
POST wishlist/plugin/:pluginId/items/:itemId/reserve
```

Production still needed:

```text
Database-backed reservations
Deeper Command Centre analytics and full moderation workflow
Scheduled expiry worker
Reservation receipts/audit events
Fulfilment/dispute workflow
```
