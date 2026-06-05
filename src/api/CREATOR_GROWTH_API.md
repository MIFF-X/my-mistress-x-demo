# Creator Growth API Client

Branch: `feature/abacus-ai-build`

Client file:

```text
frontend/src/api/creatorGrowthApi.ts
```

This API client connects the Creator Growth Tools frontend to the backend creator-growth module.

---

## Functions

```text
listCreatorGrowthCampaignPolicies()
createCreatorGrowthCampaign(input)
listMyCreatorGrowthCampaigns()
archiveCreatorGrowthCampaign(campaignId)
trackCreatorGrowthCampaignEvent(campaignId, input)
resolveCreatorGrowthPublicLanding(destinationSlug, campaignSlug)
getCreatorGrowthCampaignAnalytics(campaignId)
getCreatorGrowthPlatformAnalyticsRollup()
```

---

## Backend endpoints

```text
GET   /creator-growth/campaign-policies
POST  /creator-growth/campaign
GET   /creator-growth/campaigns/mine
PATCH /creator-growth/campaign/:campaignId/archive
POST  /creator-growth/campaign/:campaignId/event
GET   /creator-growth/landing/:destinationSlug/:campaignSlug
GET   /creator-growth/campaign/:campaignId/analytics
GET   /creator-growth/analytics/platform
```

---

## Destination types

```text
CREATOR_PROFILE
SUBSCRIPTION_TIER
LIVE_ROOM
PPV_DROP
MARKETPLACE_DROP
STICKER_DROP
LINK_IN_BIO
```

---

## Event types

```text
scan
click
profile_view
follow
subscribe
tier_view
quote
show_view
ticket_quote
ticket_purchase
drop_view
unlock_quote
unlock_purchase
product_view
approval_request
purchase
sticker_view
collect
link_view
destination_click
```

---

## CreatorGrowthCampaignPolicy

```text
type
description
label
publicSafeLandingRequired
supportsQrCode
supportsExpiry
supportsConversionTracking
suggestedCta
trackingEvents
```

Used by:

```text
CreatorGrowthToolsScreen
CampaignBuilderPreview
Campaign destination cards
```

---

## CreateGrowthCampaignInput

```text
name: string
destinationType: CreatorGrowthCampaignDestinationType
trafficSource?: string
ctaText?: string
targetId?: string
qrEnabled?: boolean
expiryEnabled?: boolean
expiresAt?: string
metadata?: Record<string, unknown>
```

Used by:

```text
CampaignBuilderPreview
```

---

## TrackGrowthCampaignEventInput

```text
eventType: CreatorGrowthCampaignEventType
source?: string
anonymousSessionId?: string
viewerUserId?: string
metadata?: Record<string, unknown>
```

Future consumers:

```text
public landing routes
QR landing screens
campaign analytics widgets
link-in-bio destination clicks
marketplace/drop/tier conversion flows
```

---

## CreatorGrowthCampaign response

```text
id
creatorUserId
name
destinationType
destinationLabel
trafficSource
ctaText
targetId
publicSafeLandingRequired
qrEnabled
expiryEnabled
expiresAt
publicPath
publicUrl
qrPayload
trackingEvents
metadata
isActive
archivedAt
updatedAt
productionReady
note
createdAt
```

---

## CreatorGrowthCampaignEvent response

```text
id
campaignId
creatorUserId
destinationType
eventType
source
anonymousSessionId
viewerUserId
metadata
productionReady
note
createdAt
```

---

## CreatorGrowthPublicLanding response

```text
campaignId
campaignName
creatorUserId
destinationType
destinationLabel
trafficSource
ctaText
targetId
publicPath
publicUrl
qrEnabled
expiryEnabled
expiresAt
publicSafeLandingRequired
requiresAuthForDestination
accessRules
allowedTrackingEvents
productionReady
note
```

Access rules:

```text
loginRequiredBeforePrivateContent
paymentRulesStillApply
verificationRulesStillApply
visibilityRulesStillApply
contentLocksStillApply
```

---

## CreatorGrowthCampaignAnalytics response

```text
campaignId
creatorUserId
campaignName
destinationType
trafficSource
totalEvents
conversionEvents
clickLikeEvents
conversionRate
byEventType
bySource
latestEventAt
productionReady
note
```

---

## CreatorGrowthPlatformAnalyticsRollup response

```text
totalCreators
totalCampaigns
activeCampaigns
archivedCampaigns
totalEvents
conversionEvents
clickLikeEvents
conversionRate
byEventType
bySource
byDestinationType
topSources
topEventTypes
topDestinationTypes
topCampaigns
latestEventAt
productionReady
note
```

Top entry shape:

```text
label
count
```

Top campaign shape:

```text
campaignId
campaignName
creatorUserId
destinationType
trafficSource
totalEvents
```

---

## Archive campaign client

Function:

```text
archiveCreatorGrowthCampaign(campaignId)
```

Endpoint:

```text
PATCH /creator-growth/campaign/:campaignId/archive
```

Used by:

```text
Saved Draft Campaigns panel
```

Current behavior:

```text
Archives the draft campaign through the backend.
Removes the archived campaign from the local saved campaigns list.
Shows archiving/loading state.
Shows success/failure notice.
```

---

## Event tracking client

Function:

```text
trackCreatorGrowthCampaignEvent(campaignId, input)
```

Endpoint:

```text
POST /creator-growth/campaign/:campaignId/event
```

Current behavior:

```text
Sends a scan/click/view/conversion-style event to the backend scaffold.
Backend validates the event against the campaign destination policy.
Backend rejects missing or archived campaigns.
Backend returns a draft event record with productionReady false until Prisma event persistence is added.
```

---

## Public landing client

Function:

```text
resolveCreatorGrowthPublicLanding(destinationSlug, campaignSlug)
```

Endpoint:

```text
GET /creator-growth/landing/:destinationSlug/:campaignSlug
```

Current behavior:

```text
Requests a public-safe campaign landing payload by destination slug and campaign slug.
Backend rejects missing or archived campaigns.
Backend returns safe campaign preview data only.
Backend includes accessRules so frontend landing screens clearly preserve login, payment, verification, visibility, and content-lock enforcement.
Backend returns allowedTrackingEvents for future landing/QR scan tracking.
```

---

## Campaign analytics client

Function:

```text
getCreatorGrowthCampaignAnalytics(campaignId)
```

Endpoint:

```text
GET /creator-growth/campaign/:campaignId/analytics
```

Current behavior:

```text
Requests a per-campaign analytics summary for the current creator/admin user.
Backend rejects missing, archived, or non-owned campaigns.
Backend summarizes in-memory events into totals, event-type counts, source counts, and conversion rate.
Backend returns productionReady false until Prisma analytics aggregation is added.
```

---

## Platform analytics rollup client

Function:

```text
getCreatorGrowthPlatformAnalyticsRollup()
```

Endpoint:

```text
GET /creator-growth/analytics/platform
```

Current behavior:

```text
Requests Headmistress/Admin platform-wide creator growth analytics.
Backend aggregates all in-memory creator growth campaigns and active campaign events.
Backend returns creator count, campaign counts, event totals, conversion rate, top sources, top event types, top destination types, and top campaigns.
Backend returns productionReady false until Prisma-backed platform analytics aggregation is added.
```

Intended consumers:

```text
Headmistress command centre
Admin analytics panels
Platform growth rollup widgets
```

---

## Current frontend consumers

```text
frontend/src/features/creator-growth/CreatorGrowthToolsScreen.tsx
frontend/src/features/creator-growth/CampaignBuilderPreview.tsx
frontend/src/features/creator-growth/CreatorGrowthAnalyticsDashboard.tsx
```

Future frontend consumers:

```text
public campaign landing screens
QR scan landing screens
discovery cards
Headmistress platform analytics dashboard
subscription tier conversion surfaces
marketplace/drop conversion surfaces
```

---

## Current limitations

```text
Campaigns are draft scaffold records until Prisma persistence is fully wired.
Events are draft scaffold records until Prisma event persistence is wired.
Public landing payloads resolve from in-memory campaigns until Prisma persistence is wired.
Campaign analytics are calculated from in-memory events until Prisma aggregation is wired.
Platform analytics rollups are calculated from in-memory campaigns/events until Prisma aggregation is wired.
QR output is currently a payload URL, not a rendered QR image.
Clipboard copy is not implemented yet; native Share API is used instead.
```

---

## Progress bars

```text
[██████████] Policy list client                    complete
[██████████] Create campaign client                complete
[██████████] List my campaigns client              complete
[██████████] Archive campaign client               complete
[██████████] Event tracking client                 complete
[██████████] Public landing client                 complete
[██████████] Campaign analytics client             complete
[██████████] Platform analytics rollup client      complete
[██████████] Event input/response types            complete
[██████████] Public landing response type          complete
[██████████] Analytics response type               complete
[██████████] Platform rollup response type         complete
[██████████] Frontend consumer screens wired        complete
[██████████] Native share helpers wired             complete
[██████████] Saved campaign archive action          complete
[██████░░░░] Landing/QR event wiring                later
[██████░░░░] Headmistress platform rollup UI        later
[██████░░░░] Prisma persistence                     later
[███░░░░░░░] Rendered QR image support              later
```
