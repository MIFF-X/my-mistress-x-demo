# Abacus AI Feature

Frontend folder:

```text
frontend/src/features/abacus
```

Primary screen:

```text
AbacusAiScreen.tsx
```

This is the scaffold for the Abacus AI / Automation Layer requested by the external artifact intake.

## Current scaffold

```text
AI revenue prediction card
best content type card
peak activity window card
churn risk card
suggested next offer card
AI Studio task handoff cards
local prompt composer
provider/runtime profile cards
fail-fast missing-key message
no-telemetry provider profile state
automation rule list
AI output audit trail
suggested action queue placeholders
typed AI ops summary API client
live p50/p95 latency, token spend, error rate, feedback coverage, model, request-class, and failing-prompt dashboard mapping
7d/30d telemetry range controls with refresh and scaffold fallback
CSV export, copy, download, and preview controls
top failing prompt drilldown cards with latest error details
persisted provider profiles, automation rules, route policies, and review gates
ops config refresh/save panel for Headmistress/Admin review
detailed request-row drilldown with saved admin review assignments
```

## Access rule

The dashboard exposes this screen to:

```text
HEADMISTRESS
MISTRESS
ADMIN
```

Subs should not receive the Abacus control surface until a separate buyer-facing assistant is designed.

## Production follow-up

```text
backend Abacus read models
provider profile storage - done through platform_settings
provider health check endpoint - done through /ai-persona/ops/provider-health
editable route-aware model policy profiles - done through platform_settings
per-message prompt feedback controls
React Native Test Persona reason-tag feedback controls - done
live chat AI request-id feedback controls - done
AI output audit persistence - done through /ai-persona/ops/output-audits and platform_settings
automation rule CRUD and run-now actions - done through /ai-persona/ops/automation-rules/:ruleId
safe live automation execution adapters - done for member review, offer draft, dashboard audit, generic task, and paused-rule guards
approval queue before generated copy/widgets go live - done through /ai-persona/ops/output-approvals
live automation execution adapters beyond run metadata - done for reviewable output audit artifacts
approved output downstream queue - done through /ai-persona/ops/downstream-queue and output approval dispatchQueue responses
downstream provider handoff evidence - done through /ai-persona/ops/downstream-queue/:itemId dispatch status controls
downstream provider readiness gate - done by combining queued downstream records with provider health and staging readiness in the dashboard
downstream dispatch server guard - done by requiring provider references plus green provider/staging readiness before dispatched status is saved
downstream dispatch readiness API - done through dispatchReadiness payloads on downstream queue and output approval responses
downstream provider dispatch plans - done by attaching provider profile, adapter, payload preview, and held/ready/sent state to downstream queue records
downstream provider validation report - done through /ai-persona/ops/downstream-queue/validation with dashboard Validate controls
detailed request-row drilldown and saved admin review assignments - done through platform_settings
review queue filters, SLA alerts, and bulk assignment actions - done for request rows and output approval go-live decisions
generated-response send-to-chat handoff - done in React Native Test Persona
live-chat conversation picker/autocomplete for generated-response handoff - done in React Native Test Persona
provider health alert history and acknowledgement workflow - done through platform_settings
```
