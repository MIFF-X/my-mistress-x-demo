# Shared Games Plugin Bucket

This bucket is the canonical frontend plugin home for shared game helpers.

## Modules

- `games-hub.js` - catalog and lookup helpers for shared game plugins.
- `lotto.js` - draw creation, number drawing, and ticket scoring helpers.
- `mystery-box.js` - prize box setup and deterministic open helpers.
- `polls.js` - poll creation, voting, and result summaries.
- `raffles.js` - ticket sale and winner draw helpers.
- `scavenger-hunt.js` - clue progress helpers.
- `scratch-card.js` - scratch card creation and reveal helpers.
- `spin-wheel.js` - wheel segment setup and spin helper.

## Status

The bucket is conflict-marker clean and import-safe. The old
`frontend/features/plugins/shared/games` bridge index was removed after the
bridge usage audit found zero active outside callers or route/path strings. The
helpers are lightweight frontend utilities; production wallet settlement,
eligibility, provider audit, and compliance checks still belong in
backend/Magnetic feature contracts.
