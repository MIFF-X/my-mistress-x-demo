# MX Stream Deck Plugin

Canonical frontend plugin home for the shared command-system Stream Deck.

This plugin turns quick replies, live controls, game prompts, booking prompts,
PPV unlock prompts, wallet prompts, stickers, admin alerts, compliance checks,
SMM prep, and personal shortcuts into role-aware button decks.

## Current Scope

- `frontend/plugins/shared/command-system/mx-stream-deck/mx-stream-deck.js`
  exposes the canonical browser/demo plugin.
- `frontend/src/features/plugins/MxStreamDeckScreen.tsx` exposes the current
  React Native-style dashboard surface.
- `frontend/plugins/shared/command-system/mx-stream-deck/MxStreamDeckScreen.jsx`
  is the canonical plugin wrapper used by the bridge screen map.
- The old `frontend/features/plugins/shared/command-system/mx-stream-deck`
  bridge was removed after active source scans found no callers.
- `docs/MX_STREAM_DECK_PLUGIN.md` tracks the product, QR setup, and backend
  handoff plan.
- `backend/src/modules/plugins/mx-stream-deck.controller.ts` owns signed setup
  sessions, SVG QR generation, setup approval, device revoke, and action audit.

## QR Setup Rule

QR setup is platform-owned. Do not send signed setup tokens to a third-party QR
service. The current backend creates short-lived setup sessions, renders the QR
image, persists setup sessions/devices/saved buttons/action logs, and records
setup/action audit rows. The next backend slice should route guarded money,
PPV, live, booking, gift, and admin actions through their owning contracts.
