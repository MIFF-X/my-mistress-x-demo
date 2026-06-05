# AI Provider Team

The AI Provider Team scaffold turns the external AI provider backlog into a visible dashboard surface. It is intentionally static for now: provider credentials, live routing and telemetry persistence are production follow-ups.

## Current scaffold

```text
AiProviderTeamScreen.tsx   React Native provider switcher and analytics surface
aiProviderTeamModel.ts     Provider profiles, capability labels, routing policies and usage rows
```

## Covered intake

```text
AI team/provider switcher for GPT/Gemini/Grok/RouteLLM-style provider choices
provider capability labels for coding, image, routing, local, hosted, private and cost tier
provider usage, token, cost and latency analytics shape for admin dashboard wiring
route-aware policy cards with approval, fallback and telemetry requirements
```

## Production follow-ups

```text
persist provider profiles and allowed capability labels
wire policy-gated provider routing to Abacus request execution
store provider health history, token usage, cost, latency and output review status
add admin approval queue for hosted fallback, high-cost routes and private-data prompts
add role/policy tests and browser e2e coverage for the provider switcher
```
