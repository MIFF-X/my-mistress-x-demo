# Shared Marketplace Plugin Bucket

This bucket is the canonical frontend plugin home for shared marketplace helper
surfaces that do not belong to a single role-owned marketplace feature.

## Modules

No reusable frontend modules live here yet. Role-owned marketplace routes and
plugin request flows currently resolve through their feature or Magnetic-backed
service folders.

## Status

The old `frontend/features/plugins/shared/marketplace-system` bridge bucket only
contained empty README placeholders and had no active source callers, so it was
removed from the temporary bridge tree. Plugin marketplace request intake,
wallet-backed purchase review, fulfilment, seller inventory, buyer shelves, and
Headmistress compliance review remain feature/Magnetic-owned until a reusable
shared marketplace helper is needed.
