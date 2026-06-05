# Headmistress Growth Rollup Summary Helper

Branch: `feature/abacus-ai-build`

This addendum documents the shareable summary helper for the Headmistress/Admin platform creator-growth rollup.

---

## Helper file

```text
frontend/src/features/creator-growth/headmistressGrowthRollupSummary.ts
```

Export:

```text
buildHeadmistressGrowthRollupSummary(input)
```

---

## Intended screen consumer

```text
frontend/src/features/creator-growth/HeadmistressGrowthRollupScreen.tsx
```

Intended dashboard action:

```text
Share Rollup
```

---

## Current helper behavior

```text
Builds a plain-text Headmistress Growth Rollup Summary.
Handles no-loaded-rollup state.
Includes platform overview metrics.
Includes Top Sources.
Includes Top Event Types.
Includes Top Destinations.
Includes Top Campaigns.
Includes draft in-memory analytics note.
```

---

## Summary sections

```text
Headmistress Growth Rollup Summary
Overview
Top Sources
Top Event Types
Top Destinations
Top Campaigns
Draft analytics note
```

---

## Overview lines

```text
Creators
Campaigns
Active campaigns
Archived campaigns
Events
Click-like events
Conversions
Conversion rate
Latest event
```

---

## Top campaign lines

```text
campaignName
totalEvents
destinationType
trafficSource
```

---

## Current wiring status

```text
Helper file is complete.
Screen Share Rollup action is pending.
The attempted full screen rewrite was blocked by safety checks, so wiring should be applied later with a smaller/safe patch.
```

---

## Current limitation

```text
The platform rollup currently comes from in-memory backend campaign/event scaffolds.
It resets on backend restart until Prisma-backed platform aggregation is added.
```

---

## Progress

```text
[██████████] Rollup summary helper                 complete
[██████████] Empty-state summary                   complete
[██████████] Overview summary lines                complete
[██████████] Top source/event/destination lines    complete
[██████████] Top campaign lines                    complete
[██████░░░░] Share Rollup screen action            pending
[██████░░░░] Native Share wiring                   pending
[██████░░░░] Prisma-backed platform analytics      later
```

---

## Next steps

```text
1. Wire buildHeadmistressGrowthRollupSummary() into HeadmistressGrowthRollupScreen.
2. Add Share Rollup button beside Load Platform Rollup.
3. Use React Native Share.share() for the first pass.
4. Add status handling for sharing, notice, and error states.
5. Update the Headmistress rollup checkpoint after wiring.
```
