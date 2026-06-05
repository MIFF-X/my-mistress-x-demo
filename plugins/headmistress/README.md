# Head-Mistress Plugins

This bucket is the canonical frontend home for Headmistress-only plugin add-ons:
platform settings, approval queues, plugin shelves, governance controls,
compliance review, revenue/split oversight, and external channel configuration.

Migrated from the temporary bridge:

```text
frontend/features/plugins/headmistress/
```

The old dashboard bridge shims in that feature-layer folder were removed on
2026-05-31 after active import verification. Real Headmistress feature screens
now live under `frontend/features/head-mistress/` while reusable plugin modules
start here.

Current files:

```text
dashboard-header.js
dashboard-layout.js
dashboard-role-picker.js
dashboard.css
```

Required admin routes and command-centre surfaces can stay in
`frontend/features/admin/` or `frontend/features/head-mistress/`, with thin
bridge links back to this plugin bucket when route visibility is still needed.
