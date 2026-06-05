# Headmistress Growth Rollup Screen

Branch: `feature/abacus-ai-build`

This addendum documents the first-pass Headmistress/Admin platform creator-growth analytics rollup screen.

---

## Screen file

```text
frontend/src/features/creator-growth/HeadmistressGrowthRollupScreen.tsx
```

Export:

```text
HeadmistressGrowthRollupScreen
```

---

## API client used

```text
getCreatorGrowthPlatformAnalyticsRollup()
```

Backend route:

```text
GET /creator-growth/analytics/platform
```

Allowed backend roles:

```text
HEADMISTRESS
ADMIN
```

---

## Current screen behavior

```text
Loads platform creator-growth rollup data.
Shows loading state.
Shows notice state.
Shows error state.
Shows draft/in-memory warning.
Shows overview metric tiles.
Shows Top Sources panel.
Shows Top Event Types panel.
Shows Top Destinations panel.
Shows Top Campaigns list.
```

---

## Overview metrics

```text
Creators
Campaigns
Active campaigns
Archived campaigns
Events
Conversions
Conversion rate
```

---

## Top panels

```text
Top Sources
Top Event Types
Top Destinations
Top Campaigns
```

Top campaign card shows:

```text
campaignName
destinationType
trafficSource
creatorUserId
totalEvents
```

---

## Current limitation

```text
The platform rollup currently comes from in-memory backend campaign/event scaffolds.
It resets on backend restart until Prisma-backed platform analytics aggregation is wired.
```

---

## Progress

```text
[██████████] Backend platform rollup service       complete
[██████████] Backend platform rollup route         complete
[██████████] Backend platform rollup tests         complete
[██████████] Frontend platform rollup API client   complete
[██████████] Headmistress rollup screen            complete
[██████████] Headmistress rollup README            complete
[██████░░░░] Dashboard card wiring                 pending
[██████░░░░] Full Headmistress analytics dashboard later
[██████░░░░] Prisma-backed platform analytics      later
```

---

## Dashboard wiring target

Suggested dashboard view:

```text
headmistressGrowthRollup
```

Suggested dashboard card:

```text
Platform Growth Rollup
Creator growth campaigns, sources, destinations and top performers
```

Suggested visibility:

```text
HEADMISTRESS
ADMIN
```

---

## Next steps

```text
1. Add this README to the focused Creator Growth docs index.
2. Wire HeadmistressGrowthRollupScreen into DashboardScreen when the route file can be patched safely.
3. Add a dashboard card under the command/core or marketplace section for Headmistress/Admin users.
4. Add a richer Headmistress analytics UI after Prisma-backed aggregation is available.
```
