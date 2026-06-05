# Shared Leaderboards

Canonical shared plugin bucket for ranking surfaces that can be mounted by
Sub, Mistress, Headmistress, or public discovery screens.

## Modules

- `leaderboards.js` builds sorted leaderboard cards from score entries.
- `positions.js` describes crown, shoe, bag, and support-position tracks.
- `status-badges.js` maps ranks and states to compact display badges.

## Bridge Status

The old `frontend/features/plugins/shared/leaderboard-system` compatibility
bridge was removed after the bridge usage audit found zero active callers. New
leaderboard source work belongs in this folder.
