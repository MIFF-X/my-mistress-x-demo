# Frontend Plugins Hub

`frontend/plugins/` is the canonical frontend home for plugin and add-on modules.
Use it for optional, reusable, role-owned, or marketplace-style modules that can be
mounted into dashboards without becoming core app plumbing.

## Canonical Buckets

| Folder | User-facing label | Use for |
| --- | --- | --- |
| `headmistress/` | Head-Mistress Plugins | Headmistress-only governance, approval, platform settings, and admin shelves. |
| `mistress/` | Mistresses Plugins | Mistress creator tools, control widgets, content tools, games, auctions, and studio add-ons. |
| `sub/` | Subs Plugins | Sub-owned add-ons such as obedience, achievements, personal tracking, and viewer widgets. |
| `site/` | Sites Plugins | Platform/public/site-wide plugins such as moderation, analytics, gates, integrations, punishments, and wall-of-shame. |
| `shared/` | Shared Plugins | Cross-role plugin domains such as games, ebooks, leaderboards, notifications, calendars, suggestions, and communications. |
| `registry/` | Plugin Registry | Catalog, manifest, dashboard widget, and plugin-discovery helpers. |

## Feature Vs Plugin Rule

Keep a module under `frontend/features/` when it is a required app journey:
auth, users, dashboard, wallet, payments, safety gates, profile, routing, or
other core surfaces that every build depends on.

Keep a module under `frontend/plugins/` when it is an optional add-on:
games, ebooks, leaderboards, punishments, wall-of-shame, live-show extras,
store add-ons, style packs, or role-specific tools that can be enabled,
disabled, sold, installed, configured, or swapped later.

## Temporary Bridge

`frontend/features/plugins/` still exists as a compatibility bridge for older
feature imports and route visibility. New plugin code should start here in
`frontend/plugins/`; bridge files should only be thin route/import shims until
the migration is finished. The Sub, Registry, and Headmistress dashboard bridge
shims have already been removed after active import verification, and the Site
bridge bucket has been removed after the bridge usage audit found no active
outside imports or runtime route/path strings. The browser platform registry
and dashboard source files now live under `frontend/plugins/registry`, with the
old root bridge files reduced to thin re-exports. Mistress punishment source now
lives under `frontend/plugins/mistress/punishment-system`, with user and
Mistress dashboard callers importing the canonical bucket. Mistress auction
source now lives under `frontend/plugins/mistress/auction-system`, with
live-commerce and Mistress dashboard callers importing the canonical bucket.
Shared after-live booking helpers live under
`frontend/plugins/shared/communication/after-live-bookings`, browser-era text
chat and live-room helpers live under `frontend/plugins/shared/communication`,
and API clients live under `frontend/plugins/shared/communication/api`. The old
`frontend/features/plugins/shared/communication` bridge bucket was removed
after the bridge usage audit reported zero active outside callers.

Do not put API, socket, auth, middleware, or business-logic glue in this folder.
Keep those under the appropriate feature, middleware, backend, or Magnetic
contract module.

## Naming Notes

- Use `ebooks` for book/handbook-style products going forward.
- Keep `auth` focused on login, registration, session entry, and role routing.
- Keep role domain data under `users`, `sub`, `mistress`, or `head-mistress`
  rather than burying all role behavior inside `auth`.

## Migration Progress

```text
Canonical plugin-root decision captured     [##########] 100%
Root plugin hub documented                  [##########] 100%
features/plugins bridge documented          [#########-]  95%
Headmistress bucket migrated; dash bridge removed [##########] 100%
Sub bucket migrated and bridge removed      [##########] 100%
Registry bucket migrated and bridge removed [##########] 100%
Platform registry/dashboard root bridge migrated [##########] 100%
Site bridge removed after usage audit       [##########] 100%
Site control cleanup migrated               [##########] 100%
Shared ebooks cleanup migrated              [##########] 100%
Shared leaderboards cleanup migrated        [##########] 100%
Shared games cleanup migrated               [##########] 100%
Shared calendar cleanup migrated            [##########] 100%
Shared suggestions cleanup migrated         [##########] 100%
Shared notifications cleanup migrated       [##########] 100%
Shared communication cleanup migrated       [##########] 100%
Shared code-lock cleanup migrated           [##########] 100%
Shared after-live bookings migrated         [##########] 100%
Shared text-chat/live rooms migrated        [##########] 100%
Legacy shared communication bridge removed  [##########] 100%
Shared command deck integrating             [########--]  82%
Mistress punishment cleanup migrated        [##########] 100%
Mistress auction cleanup migrated           [##########] 100%
Mistress PPV/wheel cleanup migrated         [##########] 100%
Role/shared bridge physical cleanup         [#########-]  97%
Import and route rewiring                   [##########]  99%
Bulk plugin move                            [#######---]  67%
```

## Maintenance

Run these after plugin-layout changes. The layout validator also verifies that
temporary `frontend/features/plugins` bridge imports resolve into canonical
`frontend/plugins` targets.

```powershell
python frontend/plugins/validate-plugin-layout.py
python scripts/audit-plugin-bridge-usage.py
bash frontend/plugins/fix-communication-duplicates.sh
```

If older branches reintroduce merge markers or duplicate migration text, clean
the README first, then migrate one plugin bucket at a time. Canonical
`frontend/plugins` is currently marker-clean; verify feature bridge imports and
routes before removing compatibility shims. The Sub, Registry, Site, and
Headmistress dashboard feature bridges were removed after active imports and
runtime route/path strings were verified clean, and the root platform
registry/dashboard bridge now has zero active outside callers. The Mistress
punishment and auction bridges are also reduced to thin re-exports. The
zero-use text-chat/live-room shims and the old `shared/communication` bridge
bucket were removed after active imports moved to canonical shared communication
modules. The bridge usage audit now reports zero outside-import bridge files,
zero route/path bridge strings, and zero stale internal bridge references.
