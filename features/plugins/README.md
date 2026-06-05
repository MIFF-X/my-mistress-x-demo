# Features/Plugins Bridge

This folder is a temporary feature-layer bridge for plugin-style UI modules.
`frontend/plugins/` is the canonical plugin home. Keep this bridge only where
older feature imports or visible feature routes still need a compatibility shim
while the plugin-first architecture is migrated safely.

## Namespaces

```text
headmistress/
mistress/
shared/
```

## Layout Rules

- New reusable plugin modules should live under the appropriate namespace in `frontend/plugins/*`.
- Feature-specific views should remain under `frontend/features/*`.
- Compatibility shims can remain here while older imports are migrated.
- API, socket, and business-logic glue should stay outside this folder, usually under middleware or backend-owned modules.
- If a module exists in both `frontend/features/plugins/*` and `frontend/plugins/*`, treat `frontend/plugins/*` as the source of truth and keep this README plus the root inventories updated until the bridge can be removed.

## Migration Status

```text
shared/communication/* feature bridge        [##########] 100%
frontend/plugins compatibility shims         [#########-]  97%
headmistress dashboard bridge removed        [##########] 100%
sub bridge removed after import scan         [##########] 100%
registry bridge removed after import scan    [##########] 100%
site bridge removed after usage audit        [##########] 100%
site control conflict cleanup                [##########] 100%
shared ebooks bridge cleanup                 [##########] 100%
shared leaderboards bridge cleanup           [##########] 100%
shared leaderboards shims removed            [##########] 100%
shared games bridge target cleanup           [##########] 100%
shared games shims removed                   [##########] 100%
shared privacy controls shims removed        [##########] 100%
shared dispute resolution shims removed      [##########] 100%
shared marketplace placeholders removed      [##########] 100%
shared commerce placeholder removed          [##########] 100%
shared command-system stream-deck removed    [##########] 100%
shared calendar/suggestions/notifications    [##########] 100%
shared calendar/suggestions/notifications shims removed [##########] 100%
shared communication cleanup                 [##########] 100%
shared code-lock cleanup                     [##########] 100%
shared code-lock shims removed               [##########] 100%
root platform registry/dashboard bridge      [##########] 100%
root platform registry/dashboard shims removed [##########] 100%
shared after-live bookings canonicalized     [##########] 100%
shared after-live booking shims removed      [##########] 100%
mistress punishment cleanup                  [##########] 100%
mistress auction cleanup                     [##########] 100%
shared text-chat/live rooms canonicalized    [##########] 100%
shared text-chat/live room shims removed     [##########] 100%
legacy shared communication bridge removed   [##########] 100%
mistress PPV/wheel cleanup                   [##########] 100%
role/shared plugin migration                 [#########-]  98%
touched bridge conflict-marker cleanup       [##########] 100%
canonical root decision                      [##########] 100%
remaining duplicate-tree cleanup             [#########-]  99%
import/route rewiring                        [##########]  99%
stale internal bridge imports                [##########] 100%
```

Current migration direction:

```text
New plugin work starts in frontend/plugins.
features/plugins stays only as a route/import bridge during migration; the Sub,
Registry, Site, and Headmistress dashboard bridges have been removed after
active imports and route/path strings were verified clean. Real Headmistress
feature screens, Mistress NFT route screens, MX Quick Setup QR, and MX NFT
Owner/Profile Cabinet screens now live in their role/shared feature folders instead of this
temporary bridge tree, and MX Stream Deck route metadata points at the canonical
dashboard screen.
Nested Mistress punishment and blog shims now resolve to canonical users,
dashboard, and site-service modules; shared Code Lock source now lives under
`frontend/plugins/shared/code-lock` and the old Code Lock bridge shims were
removed after zero active callers were verified. Shared after-live booking helpers now live
under `frontend/plugins/shared/communication/after-live-bookings` with the old
after-live bridge shims removed, and browser-era
text chat/live room helpers now live under `frontend/plugins/shared/communication/text-chat`
and `frontend/plugins/shared/communication/live-show-rooms`; their old bridge shims
were removed after zero active callers were verified. The legacy
`frontend/features/plugins/shared/communication` bridge bucket was also removed
after zero active outside callers were verified. The zero-use shared calendar,
suggestions, and notifications bridge shims were removed after canonical bucket
verification, the zero-use shared games bridge index was removed after the
canonical shared game helpers stayed import-safe, and the shared privacy controls
bridge bucket was removed after its legacy helper moved to the canonical plugin
tree. The shared dispute resolution bridge bucket was removed after its helper
moved to `frontend/plugins/shared/dispute-resolution-system`, and the README-only
shared marketplace bridge placeholder was replaced with a canonical
`frontend/plugins/shared/marketplace-system` note. The unused shared commerce
`bridgeReady` placeholder was also removed after a zero-caller audit and replaced
with a canonical `frontend/plugins/shared/commerce` note. The zero-use MX Stream
Deck bridge folder was removed after the dashboard route and plugin wrapper stayed
on canonical `frontend/src/features/plugins/MxStreamDeckScreen.tsx` and
`frontend/plugins/shared/command-system/mx-stream-deck`. The current bridge source
count is 148, with no deleted shared-games, privacy-controls, dispute-resolution,
marketplace-system, commerce, or command-system bridge references in active source
folders and no active shared bridge callers.
Browser platform registry/dashboard source now lives under
`frontend/plugins/registry`, active boot/progress imports point at the canonical
registry bucket, and the old root bridge files plus stale `plugin-screens.js`
map were removed after zero active outside callers/routes were verified.
Mistress punishment source now lives under
`frontend/plugins/mistress/punishment-system`; user and Mistress dashboard
imports point at the canonical bucket. Mistress auction source now lives under
`frontend/plugins/mistress/auction-system`; live-commerce and Mistress dashboard
imports point at the canonical bucket, and the bridge audit now reports zero
active bridge files in the Mistress namespace.
Role-specific plugin domains should move in small batches.
Bridge imports must resolve into canonical frontend/plugins targets; run the
plugin layout validator and bridge usage audit after each bridge edit.
No active outside bridge callers remain in the current audit; keep shims only
for compatibility until verified safe to remove.
```

## Maintenance Commands

```powershell
bash frontend/plugins/fix-communication-duplicates.sh
python frontend/plugins/validate-plugin-layout.py
python scripts/audit-plugin-bridge-usage.py
bash scripts/resolve-conflicts-keep-plugin-layout.sh
```

Use the conflict resolver only when older branches reintroduce duplicated plugin layout markers.
