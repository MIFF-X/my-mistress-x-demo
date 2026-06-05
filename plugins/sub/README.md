# Subs Plugins

This bucket is the canonical frontend home for Sub-facing plugin add-ons:
obedience tracking, Sub leaderboards, achievements, personal tracking, viewer
widgets, rewards, and other optional Sub-owned tools.

Migrated from the temporary bridge:

```text
frontend/features/plugins/sub/
```

Current files:

```text
obedience-tracker/tracker.js
obedience-tracker/tracker.css
sub-leaderboard/leaderboard.js
sub-leaderboard/leaderboard.css
```

The `frontend/features/plugins/sub/` bridge was removed on 2026-05-31 after
active frontend/app/backend imports were verified clean. Keep new Sub plugin
source in this canonical bucket.
