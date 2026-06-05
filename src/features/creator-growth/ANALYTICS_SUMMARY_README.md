# Creator Growth Analytics Summary Helper

Branch: `feature/abacus-ai-build`

This addendum documents the shareable analytics summary helper used by the Creator Growth Analytics Dashboard.

---

## Helper file

```text
frontend/src/features/creator-growth/creatorGrowthAnalyticsSummary.ts
```

Export:

```text
buildCreatorGrowthAnalyticsSummary(input)
```

---

## Dashboard consumer

```text
frontend/src/features/creator-growth/CreatorGrowthAnalyticsDashboard.tsx
```

Dashboard action:

```text
Share Summary
```

Current behavior:

```text
Builds a plain-text analytics summary from the currently loaded campaign analytics.
Uses the active filtered campaign set.
Uses the current date preset label.
Uses the current search text.
Includes top source and top event type rollups.
Opens the React Native Share sheet.
Shows sharing, notice, and error states.
```

---

## Summary sections

```text
Creator Growth Analytics Summary
Filters
Totals
Insights
Draft analytics note
```

---

## Filter lines

```text
Date preset
Search
Campaigns shown
```

---

## Total metric lines

```text
Events
Click-like events
Conversions
Conversion rate
```

---

## Insight lines

```text
Top campaign by events
Strongest conversion rate
Top source
Top event type
```

---

## Current limitation

```text
The summary reflects only analytics already loaded into the dashboard.
Backend analytics are still draft/in-memory until Prisma-backed aggregation is wired.
```

---

## Progress

```text
[██████████] Summary helper file                  complete
[██████████] Share Summary dashboard action       complete
[██████████] Filter summary lines                 complete
[██████████] Total metric lines                   complete
[██████████] Insight lines                        complete
[██████████] Native Share integration             complete
[██████░░░░] Prisma-backed analytics source       later
[██████░░░░] CSV/export download                  later
```

---

## Next steps

```text
1. Add this README to the focused Creator Growth docs index.
2. Update the analytics dashboard checkpoint with Share Summary details.
3. Add CSV/export download later if the app needs structured reports.
4. Replace draft in-memory analytics with Prisma-backed analytics once persistence is wired.
```
