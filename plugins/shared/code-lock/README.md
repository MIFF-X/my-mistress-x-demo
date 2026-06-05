# Shared Code Lock Plugin

Canonical helpers for configurable code-gated access panels.

This bucket owns:

- `code-lock-settings-store.js` for local Code Lock settings.
- `code-lock-settings-panel.js` for Mistress-facing configuration UI.
- `code-lock-gate.js` for Sub-facing unlock gates.
- `code-lock-wallet.js` for the local demo wallet attempt-charge helper.

The old compatibility files in `frontend/features/plugins/shared/code-lock/`
were removed after the bridge usage audit found zero active callers. Import
Code Lock helpers from this canonical folder.
