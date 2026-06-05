# Shared Commerce Plugin Bucket

This bucket is the canonical frontend plugin home for shared commerce helpers
that do not belong to a role-owned marketplace, wallet, live commerce, or
fulfilment feature.

## Modules

No reusable frontend modules live here yet. The previous temporary bridge only
exported a `bridgeReady` placeholder and had no active source callers.

## Status

The old `frontend/features/plugins/shared/commerce` bridge bucket was removed
after active source scans found no callers. Buyer shelves, seller inventory,
wallet settlement, live commerce actions, provider queues, fulfilment evidence,
and Headmistress compliance review remain feature/Magnetic-owned until a shared
commerce helper is needed.
