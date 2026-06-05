# Content Library

This feature folder owns the web dashboard scaffold for media libraries, playlists, drop calendars, pack detail pages and live-stream archive rules.

## Primary Screens

```text
ContentLibraryScreen.tsx      Dashboard module for library, playlist, drop calendar, pack and archive planning
contentLibraryModel.ts        Typed scaffold data for media types, playlists, drops, packs and archive modes
```

## Connected Feature Ideas

```text
Content libraries for songs, videos, books, movies, links, PDFs, albums and PPV collections
Mistress playlists with Sub suggestions, approval flow, add-to-own-playlist and play-count analytics
Drop calendar for sticker releases, PPV series, live shows, replay drops, card packs and goal finales
Content pack details with preview, purchase or unlock rules, watchlist, share, metrics and sticker rewards
Archive rules for public replay, subscription replay, paid replay and private archive modes
```

## Production Follow-Up

```text
GET /content-library/items
POST /content-library/items
POST /content-library/playlists
POST /content-library/playlists/:id/suggestions
POST /content-library/playlists/:id/approvals
POST /content-library/drops
GET /content-library/calendar
POST /content-library/packs
POST /content-library/packs/:id/watchlist
POST /content-library/archive-rules
Wallet, entitlement, moderation and analytics guards
```

## Local Verification

```text
npm run typecheck
```
