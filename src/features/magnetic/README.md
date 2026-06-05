# MX Magnetic Plug-and-Play Integration Layer

The Magnetic layer is the lightweight feature contract registry for the app branch.

Rules:
- Add or update one contract only when a feature slice is touched.
- Keep each contract tied to real backend routes, frontend surfaces, data types, docs, and verification.
- Do not migrate the whole app into the registry at once.
- Use contracts as handoff glue between backend, frontend, docs, Command Centre, and later plugin surfaces.

Backend registry:
- `backend/src/common/feature-registry/magnetic-feature.registry.ts`

Frontend consumers:
- `magnetic-feature-api.ts`
- `MagneticFeatureDashboardScreen.tsx`

Current plugged slices:
- `top-up-payment-options`
- `marketplace-sla-provider-incident`
- `admin-game-ops`
- `web-game-hub`
- `mystery-box`
- `ppv-content-entitlements`

Next slices should add their own contract entries beside the feature work they touch.
