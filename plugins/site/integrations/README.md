# Site Integrations

Canonical Site plugin bucket for Headmistress-controlled external links,
permission rules, ad revenue hooks, and punishment/admin integration helpers.

## Modules

- `permissions.js` defines role access for site-level integration controls.
- `third-party-links.js` normalizes Headmistress-managed external link cards.
- `ad-revenue-integration.js` keeps ad-revenue integration scaffolding.
- `apply-punishment.js`, `punishment-store.js`, and related screens bridge the
  platform punishment workflow until the dedicated punishment bucket is promoted.

## Bridge Status

New source work belongs here under `frontend/plugins/site/integrations`. Feature
or dashboard imports should remain thin shims until route usage is verified.
