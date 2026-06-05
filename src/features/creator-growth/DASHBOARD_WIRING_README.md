# Creator Growth Dashboard Wiring

Branch: `feature/abacus-ai-build`

This addendum records the dashboard cards and local dashboard views for the Creator Growth feature set.

---

## Dashboard file

```text
frontend/src/features/dashboard/DashboardScreen.tsx
```

---

## Creator Growth Tools card

Dashboard view:

```text
creatorGrowth
```

Component:

```text
CreatorGrowthToolsScreen
```

Card:

```text
Creator Growth Tools
Profile links, QR campaigns, traffic sources & conversion destinations
```

Visible to:

```text
MISTRESS
HEADMISTRESS
ADMIN
```

---

## Creator Growth Analytics card

Dashboard view:

```text
creatorGrowthAnalytics
```

Component:

```text
CreatorGrowthAnalyticsDashboard
```

Card:

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

## Related frontend files

```text
frontend/src/features/creator-growth/CreatorGrowthToolsScreen.tsx
frontend/src/features/creator-growth/CreatorGrowthAnalyticsDashboard.tsx
frontend/src/features/creator-growth/CampaignBuilderPreview.tsx
frontend/src/features/creator-growth/PublicLandingPreview.tsx
frontend/src/features/creator-growth/CreatorGrowthDestinationGate.tsx
frontend/src/features/creator-growth/CreatorGrowthPublicLandingRoute.tsx
```

---

## Progress

```text
[██████████] Creator Growth Tools dashboard card       complete
[██████████] Creator Growth Analytics dashboard card   complete
[██████████] Creator/admin dashboard visibility        complete
[██████████] Restricted fallback copy                  complete
[██████░░░░] Public landing real app route mount       pending
[██████░░░░] Prisma-backed analytics aggregation       later
```

---

## Next steps

```text
1. Add this addendum to the focused Creator Growth docs index.
2. Keep Creator Growth Tools and Creator Growth Analytics as separate cards.
3. Mount the public landing route once the real router entry point is confirmed.
4. Replace in-memory analytics with Prisma-backed aggregation after schema patching.
```
