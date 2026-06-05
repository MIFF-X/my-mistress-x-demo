# Shared Privacy Controls Plugin Bucket

This bucket is the canonical frontend plugin home for the legacy privacy/mobile
helper used by the shared Privacy Controls lane.

## Modules

- `privacy_mobile_plugin.js` - dependency-free privacy helper for block,
  unblock, blocked-state, content-visibility, and summary checks.

## Status

The old `frontend/features/plugins/shared/privacy-controls-system` bridge bucket
was removed after active source scans found no live callers for the bridge path.
The legacy Express-style helper was converted into import-safe frontend utility
functions. Production privacy, relationship-control, consent, export/delete, and
wallet pre-spend gates remain backend/Magnetic-owned.
