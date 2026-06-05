<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:1A0B2E,45:8B1E5A,100:D4AF37&height=140&section=header&text=Creator%20Growth%20Tools&fontSize=34&fontColor=FFFFFF&animation=scaleIn&fontAlignY=35&desc=Discovery%20%7C%20External%20Traffic%20%7C%20QR%20Campaigns%20%7C%20Conversion%20Paths&descAlignY=58&descSize=12" alt="Creator Growth Tools README banner" />
</p>

# Creator Growth Frontend Feature

Frontend folder:

```text
frontend/src/features/creator-growth
```

This feature gives creators/admins a first-pass growth workspace for public-safe campaign links, QR-ready payloads, campaign destination selection, saved draft campaign previews, native share helpers, draft campaign archive controls, lightweight analytics previews, public landing previews, and safe destination gate handoffs.

---

## Current files

```text
CreatorGrowthToolsScreen.tsx
CampaignBuilderPreview.tsx
PublicLandingPreview.tsx
CreatorGrowthDestinationGate.tsx
README.md
```

API client:

```text
frontend/src/api/creatorGrowthApi.ts
```

---

## Dashboard entry

The screen is wired into:

```text
frontend/src/features/dashboard/DashboardScreen.tsx
```

Dashboard view:

```text
creatorGrowth
```

Dashboard card:

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

## API calls used

```text
GET   /creator-growth/campaign-policies
POST  /creator-growth/campaign
GET   /creator-growth/campaigns/mine
PATCH /creator-growth/campaign/:campaignId/archive
POST  /creator-growth/campaign/:campaignId/event
GET   /creator-growth/landing/:destinationSlug/:campaignSlug
GET   /creator-growth/campaign/:campaignId/analytics
```

Frontend functions:

```text
listCreatorGrowthCampaignPolicies()
createCreatorGrowthCampaign()
listMyCreatorGrowthCampaigns()
archiveCreatorGrowthCampaign()
trackCreatorGrowthCampaignEvent()
resolveCreatorGrowthPublicLanding()
getCreatorGrowthCampaignAnalytics()
```

---

## CreatorGrowthToolsScreen

File:

```text
CreatorGrowthToolsScreen.tsx
```

Current behavior:

```text
Loads campaign destination policies.
Loads saved draft campaigns.
Auto-selects the first destination policy.
Displays CampaignBuilderPreview.
Displays Saved Draft Campaigns panel.
Displays campaign destination cards.
Lets creator/admin select a destination card.
Highlights selected destination with a gold border.
Refreshes policies and saved campaigns.
Shows loading and error states.
Lets saved draft campaigns share public URLs through the native share sheet.
Lets saved draft campaigns share QR payloads through the native share sheet.
Lets saved draft campaigns load analytics previews.
Lets saved draft campaigns be archived.
Removes archived campaigns from the local visible list.
Clears local analytics preview when a campaign is archived.
Shows per-campaign sharing/loading/archiving/analytics state.
Shows saved-panel share/archive/analytics notice feedback.
```

---

## CampaignBuilderPreview

File:

```text
CampaignBuilderPreview.tsx
```

Current fields:

```text
campaign name
traffic source
CTA text
QR on/off toggle
expiry on/off toggle
public-safe link preview
```

Save behavior:

```text
Validates selected destination.
Validates campaign name.
Calls createCreatorGrowthCampaign().
Shows saving state.
Shows error state.
Shows success state.
Displays returned publicUrl.
Displays returned qrPayload.
Calls onCreated(campaign) so the parent screen can update the saved campaign panel.
```

Share helper behavior:

```text
Uses React Native Share API.
Can share returned publicUrl through native share sheet.
Can share returned qrPayload through native share sheet.
Shows sharing/loading state.
Shows fallback copy-ready notice.
Does not add a clipboard dependency yet.
```

---

## PublicLandingPreview

File:

```text
PublicLandingPreview.tsx
```

Props:

```text
destinationSlug
campaignSlug
onContinue
```

Current behavior:

```text
Calls resolveCreatorGrowthPublicLanding(destinationSlug, campaignSlug).
Renders public-safe campaign preview data.
Shows campaign name, destination type, traffic source, CTA, public URL, and QR-ready state.
Shows access-rule chips for login, payment, verification, visibility, and content locks.
Shows allowed tracking events.
Tracks link_view on load when the campaign destination supports it.
Tracks destination_click when the CTA is pressed and the campaign destination supports it.
Calls optional onContinue(landing) after CTA tracking.
Shows loading, error, retry, notice, and draft persistence warning states.
```

Important rule:

```text
This component is a safe preview shell only. It does not open protected content by itself.
```

---

## CreatorGrowthDestinationGate

File:

```text
CreatorGrowthDestinationGate.tsx
```

Props:

```text
landing
onLoginRequired
onOpenDestination
```

Current behavior:

```text
Accepts a CreatorGrowthPublicLanding payload.
Shows campaign and destination context.
Maps destination type to a destination gate label.
Shows target ID and CTA.
Displays required access checks.
Preserves login, payment, verification, visibility, and content-lock rules.
Calls onLoginRequired(landing) when login is required before private content.
Calls onOpenDestination(landing) when the destination can be opened by a future gate.
Shows a draft warning until real auth/payment/verification/visibility/content-lock services are connected.
```

Destination gate labels:

```text
CREATOR_PROFILE       → Creator profile gate
SUBSCRIPTION_TIER     → Subscription tier gate
LIVE_ROOM             → Live room access gate
PPV_DROP              → PPV unlock gate
MARKETPLACE_DROP      → Marketplace item gate
STICKER_DROP          → Sticker collection gate
LINK_IN_BIO           → External/social link gate
```

Important rule:

```text
The gate is a safety handoff. It must not bypass any platform access checks.
```

---

## Saved Draft Campaigns panel

Displays:

```text
campaign name
destination label/type
traffic source
CTA text
public URL
QR payload ready status
draft scaffold warning
share URL action
share QR payload action
analytics action
archive draft action
per-campaign sharing state
per-campaign analytics loading state
per-campaign archiving state
share/archive/analytics result notice
```

Share behavior:

```text
Uses React Native Share API.
Share URL opens the native share sheet with campaign.publicUrl.
Share QR Payload opens the native share sheet with campaign.qrPayload.
QR payload share is disabled when qrEnabled is false.
Only one saved campaign share/archive/analytics action runs at a time.
```

Analytics behavior:

```text
Analytics calls getCreatorGrowthCampaignAnalytics(campaign.id).
Analytics are stored locally by campaign id.
Analytics Preview shows totalEvents, clickLikeEvents, conversionEvents, conversionRate, byEventType, bySource, and latestEventAt.
Analytics loading state appears on the per-campaign Analytics button.
Analytics success/failure is shown in the saved-panel notice line.
Analytics are cleared from local state if the campaign is archived.
```

Archive behavior:

```text
Archive Draft calls archiveCreatorGrowthCampaign(campaign.id).
Backend sets isActive false and archivedAt.
Frontend removes the archived campaign from the local saved list.
Archive button shows an archiving state.
Archive success/failure is shown in the saved-panel notice line.
```

Important limitation:

```text
Saved campaigns, public landing previews, destination gates, and analytics currently come from backend in-memory scaffolds.
They are not persisted across backend restarts until Prisma persistence/aggregation is wired.
```

---

## Analytics Preview panel

Shows:

```text
totalEvents
clickLikeEvents
conversionEvents
conversionRate
byEventType
bySource
latestEventAt
draft analytics warning
```

Current limitation:

```text
This is a preview panel only, not the final growth analytics dashboard.
```

---

## Campaign destination cards

Loaded from backend policy:

```text
CREATOR_PROFILE
SUBSCRIPTION_TIER
LIVE_ROOM
PPV_DROP
MARKETPLACE_DROP
STICKER_DROP
LINK_IN_BIO
```

Each card shows:

```text
icon
label
description
suggested CTA
public-safe landing chip
QR-ready chip
expiry-supported chip
conversion-tracking chip
tracked event chain
selected state
```

---

## Public-safe rule

```text
Campaign links and QR payloads are public-safe entry points only.
They must not bypass login, age checks, verification, payment, visibility rules, subscriptions, marketplace approval, or content locks.
```

PublicLandingPreview displays the safety reminders as UI chips:

```text
login required before private content
payment rules apply
verification applies
visibility rules apply
content locks apply
```

CreatorGrowthDestinationGate displays the required checks again before handoff.

---

## Current user flow

```text
Dashboard
→ Creator Growth Tools
→ Select destination card
→ Enter campaign name/source/CTA
→ Choose QR/expiry options
→ Save Draft Campaign
→ See public URL and QR payload
→ Share public URL or QR payload from builder
→ Saved Draft Campaigns panel updates
→ Share saved campaign public URL or QR payload later from the saved list
→ Load analytics preview for saved draft campaigns
→ Archive old draft campaigns from the saved list
→ Future /g/:destinationSlug/:campaignSlug screen mounts PublicLandingPreview
→ PublicLandingPreview resolves safe campaign payload
→ PublicLandingPreview tracks link_view and destination_click where allowed
→ PublicLandingPreview hands off to CreatorGrowthDestinationGate
→ CreatorGrowthDestinationGate confirms access checks
→ Destination access then enforces platform rules
```

---

## Progress bars

```text
[██████████] Creator Growth Tools screen                       complete
[██████████] Campaign destination cards                        complete
[██████████] Campaign Builder Preview                          complete
[██████████] Save Draft Campaign button                        complete
[██████████] Saved Draft Campaigns panel                       complete
[██████████] Native Share API helper                           complete
[██████████] Builder public URL share button                   complete
[██████████] Builder QR payload share button                   complete
[██████████] Saved campaign public URL share button            complete
[██████████] Saved campaign QR payload share button            complete
[██████████] Saved campaign archive button                     complete
[██████████] Saved campaign Analytics button                   complete
[██████████] Saved campaign Analytics Preview panel            complete
[██████████] PublicLandingPreview component                    complete
[██████████] CreatorGrowthDestinationGate component            complete
[██████████] Public landing access-rule chips                  complete
[██████████] Public landing link_view tracking scaffold        complete
[██████████] Public landing destination_click tracking scaffold complete
[██████████] Destination gate safety checks                    complete
[██████████] Saved campaign sharing/loading/archiving state    complete
[██████████] Saved campaign analytics loading state            complete
[██████░░░░] Mount public landing route                        later
[██████░░░░] True clipboard copy                               later, needs dependency
[██████░░░░] Prisma persistence                                later
[███░░░░░░░] Real QR image rendering                           later
[███░░░░░░░] Full growth analytics dashboard                   later
```

---

## Still to build

```text
mount public landing route/screen
real auth/payment/verification/visibility/content-lock service integration
Prisma campaign persistence
Prisma event persistence/analytics aggregation
real QR image rendering
clipboard copy dependency, if wanted
full growth analytics dashboard
campaign edit/restore controls
Headmistress discovery controls
buyer-facing discovery surfaces
```

---

## Local verification

```powershell
cd C:\Users\Guest1\MY-MISTRESS-X\frontend
npm run typecheck
```
