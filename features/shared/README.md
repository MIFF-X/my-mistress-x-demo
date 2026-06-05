# Shared Feature Screens

Cross-role route-backed screens that are part of the app feature surface but
are not reusable plugin source modules.

## Modules

- `device-link/mx-quick-setup/` - MX Quick Setup QR and trusted-device pairing screen.

## Boundary

Reusable add-on/plugin source stays under `frontend/plugins/shared`. Screens in
this folder are mounted by the app or plugin registry and can call backend APIs,
but they should not become the canonical source for plugin packages.
