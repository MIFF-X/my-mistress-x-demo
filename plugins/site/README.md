# Site Plugins

`frontend/plugins/site/` is the canonical home for platform and public site add-ons.
These modules are owned by the site/platform layer rather than a single Sub or
Mistress profile.

## Canonical Domains

- `analytics/` - platform analytics routes, services, cache middleware, and dashboard assets.
- `gatekeeper/` - entry gates, access timers, and site-wide access helpers.
- `integrations/` - external integrations, ad revenue hooks, third-party links, and permission helpers.
- `moderation/` - moderation queues, bans, flags, and review helpers.
- `monetization/` - site wallet, pricing, payments, tip jars, and monetisation hubs.
- `observability/` - Prometheus, Grafana, cache metrics, and runtime diagnostics.
- `plugin-marketplace/` - plugin catalogue UI, install, add-on, and lifecycle scaffolds.
- `punishments/` - platform-visible punishment display and governance scaffolds.
- `schema/` - SQL schemas, views, and analytics event definitions.
- `services/` - platform service adapters and shared site scripts.
- `wall-of-shame/` - public Wall of Shame display, posts, and comment scaffolds.

## Bridge Rule

The old `frontend/features/plugins/site/*` bridge bucket was removed after the
bridge usage audit found zero outside imports and zero runtime route/path
strings. New source work belongs in this folder; recreate a bridge only if a
real legacy caller is verified first.

## Migration Status

```text
Site plugin README conflict cleanup         [##########] 100%
Site payment-core bridge                    [##########] 100%
Site plugin-marketplace bridge              [##########] 100%
Site wall-of-shame bridge                   [##########] 100%
Site feature bridge removal                 [##########] 100%
Remaining site conflict-marker cleanup      [##########] 100%
```
