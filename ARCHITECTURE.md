# Frontend Architecture Contract

This contract records the folder-structure decision from the plugin
consolidation conversation so every active chat works from the same rule.

## Decision

Use one canonical frontend plugin hub:

```text
frontend/plugins/
```

Keep `frontend/features/plugins/` only as a temporary compatibility bridge for
older imports, route shims, and migration visibility. Do not create new plugin
source modules there unless the file is deliberately a thin bridge back to
`frontend/plugins/`.

## Canonical Plugin Buckets

```text
frontend/plugins/headmistress/  Head-Mistress Plugins
frontend/plugins/mistress/      Mistresses Plugins
frontend/plugins/sub/           Subs Plugins
frontend/plugins/site/          Sites Plugins
frontend/plugins/shared/        Shared cross-role plugins
frontend/plugins/registry/      Plugin catalog and manifest helpers
```

The four user-facing buckets are Head-Mistress, Mistresses, Subs, and Sites.
`shared` and `registry` are support buckets that keep cross-role code and
plugin discovery from being duplicated.

## Core Features Stay In Features

Keep these as core feature modules:

```text
frontend/features/auth/
frontend/features/users/
frontend/features/dashboard/
frontend/features/money/
frontend/features/payments/
frontend/features/wallet/
frontend/features/profile/
frontend/features/live/
frontend/features/progress/
```

`auth` should stay focused on login, registration, session entry, and role
routing. Role-specific user behavior belongs under `users`, `sub`, `mistress`,
`head-mistress`, or a plugin bucket, not buried inside auth internals.

## Plugin Candidates

These are plugin-style modules and should consolidate under `frontend/plugins/`
over time:

```text
games
ebooks
leaderboards
punishments
wall-of-shame
live-show extras
store add-ons
style packs
plugin marketplace add-ons
```

Use `ebooks` for the book/handbook product lane going forward. Existing
handbook-named files can be migrated in small batches after imports are mapped.

## Migration Order

1. Keep docs and progress boards honest before moving files.
2. Clean README/conflict-marker drift in the plugin hub.
3. Move or mirror one plugin bucket at a time into `frontend/plugins/`.
4. Replace `frontend/features/plugins/*` files with thin shims or remove them
   only after imports and routes are verified.
5. Run the plugin layout validator and the relevant frontend checks.
6. Update the Backstage progress board after every landed bucket.

## Current Status

```text
Architecture decision captured       [##########] 100%
Canonical plugin hub documented      [##########] 100%
Headmistress bucket migrated         [##########] 100%
Sub bucket migrated                  [##########] 100%
Site bridge slice migrated           [##########] 100%
Site control cleanup migrated        [##########] 100%
Shared ebooks cleanup migrated       [##########] 100%
Shared leaderboards cleanup migrated [##########] 100%
features/plugins bridge labelled     [#########-]  94%
Actual duplicate plugin migration    [######----]  66%
Import and route rewiring            [##########]  99%
Runtime verification                 [#########-]  87%
```
