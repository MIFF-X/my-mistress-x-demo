# Creator Growth Analytics CSV Export

Branch: `feature/abacus-ai-build`

This addendum documents the first-pass CSV export helper and dashboard Share CSV action for Creator Growth analytics.

---

## Helper file

```text
frontend/src/features/creator-growth/creatorGrowthAnalyticsCsv.ts
```

Export:

```text
buildCreatorGrowthAnalyticsCsv(input)
```

---

## Dashboard consumer

```text
frontend/src/features/creator-growth/CreatorGrowthAnalyticsDashboard.tsx
```

Dashboard action:

```text
Share CSV
```

Current behavior:

```text
Builds a CSV string from the currently visible/filtered campaign set.
Uses currently loaded campaign analytics.
Includes active date preset label.
Includes active search text.
Opens the React Native native Share sheet.
Shows sharing, notice, and error states.
```

---

## CSV columns

```text
campaignId
campaignName
destinationType
destinationLabel
trafficSource
ctaText
publicUrl
datePreset
searchText
totalEvents
clickLikeEvents
conversionEvents
conversionRate
byEventType
bySource
latestEventAt
analyticsLoaded
productionReady
createdAt
```

---

## Serialization rules

```text
CSV values are escaped when needed.
Quotes are doubled inside quoted values.
Line breaks and commas are safely wrapped.
byEventType is serialized as key:value pairs joined with pipes.
bySource is serialized as key:value pairs joined with pipes.
Campaigns without loaded analytics still export with zero metrics and analyticsLoaded = no.
```

---

## Current limitation

```text
The current Share CSV action shares plain CSV text through the native share sheet.
It does not yet create a downloadable .csv file attachment.
Analytics are still based on in-memory backend event scaffolds until Prisma-backed aggregation is wired.
```

---

## Progress

```text
[██████████] CSV helper file                       complete
[██████████] Share CSV dashboard action            complete
[██████████] CSV escaping                          complete
[██████████] Filtered campaign export              complete
[██████████] Analytics loaded/unloaded flag        complete
[██████████] byEventType serialization             complete
[██████████] bySource serialization                complete
[██████░░░░] Real CSV file attachment/download     later
[██████░░░░] Prisma-backed analytics source        later
```

---

## Next steps

```text
1. Add this README to the focused Creator Growth docs index.
2. Update the analytics dashboard checkpoint with Share CSV details.
3. Add a real .csv file attachment/download flow later if the runtime supports file writing/sharing.
4. Replace draft in-memory analytics with Prisma-backed analytics once persistence is wired.
```
