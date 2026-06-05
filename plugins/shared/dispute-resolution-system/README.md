# Shared Dispute Resolution Plugin Bucket

This bucket is the canonical frontend plugin home for lightweight supplier and
dispute helper utilities.

## Modules

- `supplier-dispute-system.js` - in-memory supplier/dispute helper used for
  frontend scaffold and parser smoke coverage.

## Status

The old `frontend/features/plugins/shared/dispute-resolution-system` bridge
bucket was removed after active source scans found no live callers for the bridge
path. Production supplier cases, evidence review, escalations, audit logs, and
role guards remain backend/Magnetic-owned.
