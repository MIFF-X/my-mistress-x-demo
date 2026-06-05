# Plugin Registry

Canonical frontend registry bucket for platform plugin catalog data and registry
screens.

This bucket owns:

- `platform-plugin-registry.js` for the detailed platform plugin metadata.
- `platform-plugin-types.js` and `platform-plugin-next-tasks.js` for registry
  helpers.
- `platform-plugin-dashboard-placeholder.js`,
  `platform-plugin-detail-placeholder.js`, `plugin-group-summary-placeholder.js`,
  and `backend-task-dashboard-placeholder.js` for the browser registry surfaces.

The compatibility files in `frontend/features/plugins/` should stay thin
re-exports until the remaining route/import bridge can be removed.
