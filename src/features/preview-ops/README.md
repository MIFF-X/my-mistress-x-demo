# Preview Ops

This feature folder owns the web dashboard scaffold for local preview tunnels, dev environment readiness, secure public-preview warnings and shutdown safety.

## Primary Screens

```text
PreviewOpsScreen.tsx      Dashboard module for tunnel playbook, readiness checks, secure-preview guards and shutdown runbook
previewOpsModel.ts        Typed scaffold data for cloudflared steps, services, public guards and stop actions
```

## Connected Feature Ideas

```text
Cloudflare Tunnel/cloudflared named tunnel setup with ingress, local service install, metrics and logs
Dev environment status panel for local API, frontend, websocket, tunnel, database and payment provider readiness
Secure preview warnings for secrets, auth, demo data boundaries and preview expiry ownership
Shutdown safety runbook for stopping tunnels, revoking temporary access, collecting redacted logs and resetting local services
```

## Production Follow-Up

```text
GET /admin/preview-ops/readiness
POST /admin/preview-ops/checks/run
POST /admin/preview-ops/tunnels/record
POST /admin/preview-ops/public-share/approve
POST /admin/preview-ops/shutdown
GET /admin/preview-ops/logs
Admin-only role guards, redacted log storage, public-preview expiry jobs and provider-specific readiness adapters
```

## Local Verification

```text
npm run typecheck
```
