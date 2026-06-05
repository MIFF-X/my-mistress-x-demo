# Site Moderation

Canonical Site plugin bucket for platform moderation helpers.

## Modules

- `flags.js` creates and groups moderation flags.
- `bans.js` creates ban records and checks active ban state.
- `moderation.js` summarizes flags and bans for dashboard surfaces.

## Bridge Status

These helpers are import-safe canonical plugin modules. Full moderation queue
persistence still belongs to the backend moderation contract.
