# Creator Growth Public Landing Route

Branch: `feature/abacus-ai-build`

This addendum documents the first-pass public landing route wrapper.

---

## Current files

```text
PublicLandingPreview.tsx
CreatorGrowthDestinationGate.tsx
CreatorGrowthPublicLandingRoute.tsx
```

---

## Route wrapper

File:

```text
CreatorGrowthPublicLandingRoute.tsx
```

Props:

```text
destinationSlug
campaignSlug
onLoginRequired
onOpenDestination
```

Behavior:

```text
Renders PublicLandingPreview first.
Receives the resolved landing payload from onContinue.
Stores that payload locally.
Switches to CreatorGrowthDestinationGate.
Passes login/open callbacks through to the gate.
```

---

## Intended mount path

```text
/g/:destinationSlug/:campaignSlug
```

Example:

```text
/g/subscription-tier/may-launch
```

---

## Public preview step

Component:

```text
PublicLandingPreview
```

Does:

```text
resolves public landing payload
shows safe campaign preview
tracks link_view where allowed
tracks destination_click where allowed
hands resolved landing to the route wrapper
```

---

## Destination gate step

Component:

```text
CreatorGrowthDestinationGate
```

Does:

```text
shows destination context
shows required access checks
routes to login/access callback where needed
routes to open-destination callback where allowed by future services
```

---

## Safety rule

```text
Public links and QR payloads are entry points only.
They must not bypass login, payment, verification, visibility, or content-lock checks.
```

---

## Progress

```text
[██████████] PublicLandingPreview               complete
[██████████] CreatorGrowthDestinationGate       complete
[██████████] CreatorGrowthPublicLandingRoute    complete
[██████░░░░] Real app/router mount              later
[██████░░░░] Real access service integration    later
[██████░░░░] Prisma-backed campaign lookup      later
```

---

## Next steps

```text
1. Mount CreatorGrowthPublicLandingRoute in the real app router.
2. Map /g/:destinationSlug/:campaignSlug params into the wrapper props.
3. Connect onLoginRequired to the auth/login flow.
4. Connect onOpenDestination to destination-specific access services.
5. Replace in-memory campaign lookup with Prisma-backed lookup.
```
