# Dashboard Feature Folder

This folder contains the role-based dashboard mapping layer for Mistress-X.

## Purpose

The dashboard folder turns hand-drawn dashboard planning into visible frontend scaffolds.

It keeps the platform organised across three role surfaces:

- **Sub Dashboard** — account tools, wallet, vault, collections, live schedule, games, and progress.
- **Mistress Dashboard** — monetisation tools, quick checks, live rooms, content, bookings, store, and Rolodex.
- **Headmistress Control Centre** — platform oversight, revenue, plugins, content zones, compliance, and analytics.

## Files

| File | Purpose |
|---|---|
| `dashboard-module-register-placeholder.js` | Visual dashboard module register with role filters, module rows, route buttons, and safety-gate labels. |
| `dashboard-register-route-manifest.js` | Central list of route keys and target placeholder systems. |
| `dashboard-route-health-placeholder.js` | Route health screen showing registered route keys, categories, targets, and scaffold status. |
| `dashboard-safety-gates.js` | Registry of sensitive dashboard modules and the safety level required before live wiring. |
| `dashboard-safety-gates-placeholder.js` | Visible safety-gates screen showing protected modules, reasons, and launch rules. |
| `dashboard-build-priorities.js` | Priority queue for deciding which dashboard modules to build now, next, later, or safety-first. |
| `dashboard-rolodex-scope-rules.js` | Role-scope rules for Sub Little Black Book, Mistress Rolodex, and Headmistress Master Rolodex. |
| `dashboard-rolodex-scope-placeholder.js` | Visible screen explaining the role-based Rolodex visibility rules. |
| `dashboard-architecture-summary-placeholder.js` | Final architecture overview screen summarising route keys, safety gates, priorities, and Rolodex scopes. |

## Current Flow

1. Dashboard ideas are captured in `docs/DASHBOARD_MODULE_REGISTER.md`.
2. Route keys are captured in `dashboard-register-route-manifest.js`.
3. Route docs are captured in `docs/DASHBOARD_ROUTE_MANIFEST.md`.
4. Safety rules are captured in `dashboard-safety-gates.js` and `docs/DASHBOARD_SAFETY_GATES.md`.
5. Build priorities are captured in `dashboard-build-priorities.js` and `docs/DASHBOARD_BUILD_PRIORITIES.md`.
6. Rolodex scope rules are captured in `dashboard-rolodex-scope-rules.js` and `docs/DASHBOARD_ROLODEX_SCOPE_RULES.md`.
7. The architecture summary brings the dashboard map, route map, safety map, priority map, and Rolodex scope map together.

## Build Rules

Every dashboard module must be one of these states:

- `planned` — feature is recorded but not yet built.
- `scaffolded` — placeholder screen exists and can be opened safely.
- `wired` — frontend route connects to real feature logic.
- `live` — frontend and backend are connected and ready for testing.

Every dashboard tile should either:

1. open a safe placeholder screen,
2. open a plugin detail page,
3. open a backend task capture screen, or
4. stay queued until a safe route exists.

## Rolodex Scope Rule

- **Headmistress** has the only Master Rolodex and may see all Mistresses and Subs for platform oversight.
- **Mistresses** only see their own collected Subs.
- **Subs** only see their own collected Mistresses.

## Next Safe Chunks

- Wire the route health, safety gates, Rolodex scope, and architecture summary screens into the main app shell.
- Start Mistress Dashboard utility tiles, beginning with Quick Check Zone.
- Scaffold Rolodex/contact-card UI with role-scoped data rules.
- Keep Locked Vault, Master Rolodex, PPV, live, paid calls, inventory, and bank controls behind safety gates until the backend guard layer is ready.
