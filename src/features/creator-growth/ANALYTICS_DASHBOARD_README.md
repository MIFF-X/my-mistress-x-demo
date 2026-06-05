# Creator Growth Analytics Dashboard

Branch: `feature/abacus-ai-build`

This addendum documents the first-pass Creator Growth analytics dashboard component, dashboard wiring, Quick Insights panel, Suggested Actions panel, Share Summary action, Share CSV action, rollup comparison panels, lightweight visual bar rows, campaign card sort controls, search/filter controls, and date preset filters.

---

## Component

```text
frontend/src/features/creator-growth/CreatorGrowthAnalyticsDashboard.tsx
```

Export:

```text
CreatorGrowthAnalyticsDashboard
```

---

## Dashboard wiring

Wired into:

```text
frontend/src/features/dashboard/DashboardScreen.tsx
```

Dashboard view:

```text
creatorGrowthAnalytics
```

Dashboard card:

```text
Creator Growth Analytics
Campaign events, sources, conversions & rates
```

Visible to:

```text
MISTRESS
HEADMISTRESS
ADMIN
```

Restricted fallback:

```text
Creator Growth Analytics are for Mistresses, Headmistress, and Admin.
Subs will see buyer-facing discovery and landing surfaces when they are added.
```

---

## API functions used

```text
listMyCreatorGrowthCampaigns()
getCreatorGrowthCampaignAnalytics(campaignId)
```

Backend endpoints:

```text
GET /creator-growth/campaigns/mine
GET /creator-growth/campaign/:campaignId/analytics
```

---

## Export helpers used

```text
buildCreatorGrowthAnalyticsSummary()
buildCreatorGrowthAnalyticsCsv()
```

Helper files:

```text
frontend/src/features/creator-growth/creatorGrowthAnalyticsSummary.ts
frontend/src/features/creator-growth/creatorGrowthAnalyticsCsv.ts
```

---

## Current behavior

```text
Loads active saved campaigns.
Loads analytics for one campaign.
Loads analytics for filtered visible campaigns.
Stores analytics by campaign id.
Shows overview totals.
Shows Quick Insights panel.
Shows Suggested Actions panel.
Shows Share Summary action.
Shows Share CSV action.
Shows rollup comparison panels.
Shows proportional visual bar rows inside rollup panels.
Shows campaign card search/filter controls.
Shows date preset filters.
Shows campaign card sort controls.
Shows per-campaign analytics cards.
Shows loading, notice, and error states.
Shows draft analytics warning until Prisma aggregation is added.
```

---

## Share Summary action

```text
Builds a plain-text analytics summary.
Uses the currently filtered campaign set.
Includes date preset, search text, visible campaign count, totals, and insights.
Opens the React Native native Share sheet.
```

Summary sections:

```text
Filters
Totals
Insights
Draft analytics note
```

---

## Share CSV action

```text
Builds CSV text from the currently filtered campaign set.
Uses currently loaded campaign analytics.
Includes active date preset label and search text.
Includes campaign metadata and analytics metric columns.
Includes byEventType and bySource serialized columns.
Includes analyticsLoaded and productionReady flags.
Opens the React Native native Share sheet.
```

CSV limitation:

```text
Share CSV currently shares plain CSV text, not a downloadable .csv file attachment.
A real file attachment/download flow can be added later if the runtime supports file writing and file sharing.
```

---

## Overview metrics

```text
Campaigns
Loaded campaigns
Showing filtered campaigns
Total events
Click-like events
Conversions
Overall conversion rate
```

---

## Quick Insights panel

Tiles:

```text
Top campaign by events
Strongest conversion rate
Top source
Top event type
```

Insight behavior:

```text
Uses currently filtered campaigns only.
Uses loaded campaign analytics only.
Shows “Load analytics first” when there is not enough data.
Top campaign by events uses totalEvents.
Strongest conversion rate uses conversionRate.
Top source uses the first Top Sources rollup row.
Top event type uses the first Top Event Types rollup row.
```

---

## Suggested Actions panel

Action priority labels:

```text
SETUP
GROWTH
CONVERSION
SCALE
```

Suggestion behavior:

```text
Shows setup guidance when there are no campaigns.
Shows setup guidance when campaign analytics have not been loaded.
Suggests sharing public campaign links or QR payloads when loaded campaigns have no events.
Suggests tightening the CTA or destination match when clicks exist but conversion rate is low.
Suggests doubling down on the top traffic source when source data exists.
Suggests watching the leading event type when event-type data exists.
Shows a fallback testing recommendation when campaign data is usable but no special rule is triggered.
Limits visible suggestions to the first four actions.
Uses the currently filtered analytics view.
```

---

## Rollup comparison panels

```text
Top Sources
Top Event Types
```

Rollup behavior:

```text
Combines bySource totals across currently filtered, loaded campaigns.
Combines byEventType totals across currently filtered, loaded campaigns.
Sorts rollup rows from highest to lowest.
Shows empty states before analytics are loaded.
Highlights the top row in gold.
```

Visual bar-row behavior:

```text
Scales each row against the highest value in that panel.
Uses a minimum 8% width so small values remain visible.
Uses a gold bar for the top row.
Uses muted grey bars for lower rows.
Requires no new chart dependency.
```

---

## Date preset filters

```text
All
7 days
30 days
90 days
```

Current date-filter behavior:

```text
Filters campaign cards by campaign.createdAt.
Filters the overview Showing count.
Filters the loaded analytics totals and rollups to the currently visible campaign set.
Load Filtered Analytics only loads analytics for campaigns matching the current search/date filters.
Clear filters resets search and date preset to All.
```

Important limitation:

```text
Date presets currently filter campaign creation date, not individual event timestamps.
True event-date filtering requires Prisma-backed event persistence and queryable event timestamps.
```

---

## Campaign card search/filter controls

Search fields:

```text
campaign name
destination type
destination label
traffic source
CTA text
public URL
```

Search behavior:

```text
Search is case-insensitive.
Search works together with the selected date preset and sort mode.
Clear filters resets search and date preset.
Showing metric displays the filtered campaign count.
An empty filtered state appears when no loaded campaigns match.
```

---

## Campaign card sort controls

```text
Newest
Events
Conversions
Rate
```

Sort behavior:

```text
Newest sorts campaigns by createdAt descending.
Events sorts loaded campaign cards by totalEvents descending.
Conversions sorts loaded campaign cards by conversionEvents descending.
Rate sorts loaded campaign cards by conversionRate descending.
Campaigns without loaded analytics safely sort as zero for analytics-based modes.
```

---

## Per-campaign card metrics

```text
Events
Click-like events
Conversions
Conversion rate
By event type breakdown
By source breakdown
Latest event time
```

---

## Current limitation

```text
Analytics are calculated from in-memory backend event scaffolds.
They reset on backend restart until CreatorGrowthCampaignEvent is Prisma-backed.
```

---

## Progress

```text
[██████████] Analytics API client                   complete
[██████████] Analytics dashboard component          complete
[██████████] Overview metric tiles                  complete
[██████████] Quick Insights panel                   complete
[██████████] Top campaign insight                   complete
[██████████] Strongest conversion rate insight      complete
[██████████] Top source insight                     complete
[██████████] Top event type insight                 complete
[██████████] Suggested Actions panel                complete
[██████████] Setup recommendations                  complete
[██████████] Growth recommendations                 complete
[██████████] Conversion recommendations             complete
[██████████] Scale recommendations                  complete
[██████████] Share Summary action                   complete
[██████████] Share CSV action                       complete
[██████████] Native Share export actions            complete
[██████████] Per-campaign analytics cards           complete
[██████████] Top Sources rollup panel               complete
[██████████] Top Event Types rollup panel           complete
[██████████] Rollup sorting                         complete
[██████████] Proportional visual bar rows           complete
[██████████] Top-row gold highlight                 complete
[██████████] Campaign card search/filter            complete
[██████████] Clear filters action                   complete
[██████████] Showing filtered count metric          complete
[██████████] Empty filtered state                   complete
[██████████] Date preset filters                    complete
[██████████] Filtered analytics totals              complete
[██████████] Filtered rollups                       complete
[██████████] Load Filtered Analytics                complete
[██████████] Search + date + sort combined          complete
[██████████] Campaign card sort controls            complete
[██████████] Newest sort                            complete
[██████████] Events sort                            complete
[██████████] Conversions sort                       complete
[██████████] Rate sort                              complete
[██████████] Load single campaign analytics         complete
[██████████] Dashboard route/card wiring            complete
[██████████] Creator/admin access guard             complete
[██████░░░░] Prisma-backed analytics aggregation    later
[██████░░░░] Event-date filtering                   later
[██████░░░░] Real CSV file attachment/download      later
[██████░░░░] Charts/time-series views               later
```

---

## Next steps

```text
1. Replace in-memory event aggregation with Prisma-backed analytics.
2. Add real event-date filtering when persisted event timestamps are queryable.
3. Add source comparison and campaign trend charts once analytics persistence is stable.
4. Add real CSV file attachment/download once runtime file-sharing support is selected.
5. Add Headmistress rollup analytics after per-creator analytics are stable.
```
