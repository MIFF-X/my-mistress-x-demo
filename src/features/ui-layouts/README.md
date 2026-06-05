<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:050505,45:8B1E5A,100:D4AF37&height=130&section=header&text=UI%20Layouts%20Feature&fontSize=34&fontColor=FFFFFF&animation=twinkling&fontAlignY=38&desc=Shared%20web%20%2B%20app%20layout%20system%20for%20Mistress-X&descAlignY=62&descSize=13" alt="UI Layouts Feature" />
</p>

# UI Layouts Feature

Branch: `feature/abacus-ai-build`

This folder contains the universal web/app layout system for Mistress-X. It lets the app offer different dashboard modes without building completely separate UI systems for web and native/app views.

---

## Purpose

```text
Shared design tokens
  -> reusable dashboard/card components
  -> responsive shell rules
  -> role-aware layout presets
  -> style pack skin layer
  -> applied theme resolver
  -> theme token resolver
  -> dashboard style adapter
  -> custom UI request drafts
  -> local analytics/debug stream
  -> admin analytics summary
  -> user-selectable UI Layout Studio
```

The goal is to let Headmistress, Mistress and Sub users choose layouts such as command dashboards, creator dashboards, sub dashboards, Little Black Book views, style marketplaces and vertical live-room layouts, then pair those layouts with free, paid or custom style packs.

---

## Files

| File | Purpose |
|---|---|
| `layoutPresets.ts` | Preset registry for Empire Command, Mistress Creator, Sub Dashboard, Little Black Book, Style Marketplace and Vertical Live Room |
| `responsiveDashboardShell.ts` | Responsive shell rules for mobile/app, tablet, desktop and wide desktop |
| `layoutSelectorCopy.ts` | Copy and progress text used by the selector |
| `uiLayoutStore.ts` | Per-user/per-role layout preference storage with memory and browser storage fallback |
| `uiLayoutStylePacks.ts` | Free, paid and custom style pack metadata for layout skins |
| `uiLayoutStylePackStore.ts` | Per-user/per-role style pack preference storage with apply protection |
| `uiLayoutAppliedTheme.ts` | Combines saved layout + saved style pack into the active applied theme state |
| `uiLayoutThemeTokens.ts` | Converts the applied theme into accent, surface, border, glow, density and radius tokens |
| `uiLayoutDashboardStyleAdapter.ts` | Converts theme tokens into dashboard container, card, chip, text and spacing styles |
| `uiLayoutCustomRequest.ts` | Draft custom layout request model, creation helper, list helper and status updates |
| `uiLayoutAnalytics.ts` | Local analytics event scaffold for layout, style pack and custom request actions |
| `uiLayoutAdminAnalyticsSummary.ts` | Rolls local layout analytics into admin/headmistress summaries and highlights |
| `dashboardUiLayoutBridge.ts` | Maps dashboard roles to layout audiences and builds bridge state |
| `uiLayoutDashboardModule.ts` | Dashboard module/widget metadata for the UI Layout Studio |
| `UiLayoutSelectorScreen.tsx` | Selector screen with applied theme card, token/style previews, save, lock, reset, previews, style packs, custom requests and analytics toggle |
| `UiLayoutAppliedThemeCard.tsx` | Applied layout/theme summary card shown at the top of the selector |
| `UiLayoutThemeTokenCard.tsx` | Theme token preview card for inspecting resolved visual tokens |
| `UiLayoutDashboardStyleAdapterCard.tsx` | Mini dashboard preview driven by the resolved dashboard style adapter |
| `UiLayoutPreviewCards.tsx` | Mobile/app/tablet/web layout preview cards with app/web focus filters |
| `UiLayoutStylePackCards.tsx` | Style pack cards with filters, apply controls, custom request hook and analytics tracking |
| `UiLayoutCustomRequestPanel.tsx` | Draft custom request panel with request cards, status controls and analytics tracking |
| `UiLayoutAnalyticsPanel.tsx` | Local analytics debug panel with refresh and clear controls |
| `UiLayoutAdminAnalyticsSummaryCard.tsx` | Headmistress/admin summary card for layout activity, style pack actions and custom request actions |
| `UiLayoutStudioCard.tsx` | Reusable dashboard card showing active layout state |
| `UiLayoutStudioLauncher.tsx` | Launcher that toggles between card and selector |
| `uiLayoutDashboardRoute.tsx` | Dashboard-ready route wrapper for direct navigation and live surface width detection |
| `useUiLayoutSurfaceWidth.ts` | React Native surface width hook for responsive shell previews |
| `index.ts` | Barrel exports for the feature |

---

## Current status

```text
[██████████] Layout preset registry
[██████████] Responsive shell rules
[██████████] Selector screen
[██████████] Layout preference store
[██████████] Responsive preview cards
[██████████] App/web preview filters
[██████████] Style pack metadata
[██████████] Style pack cards
[██████████] Style pack preference store
[██████████] Style pack apply controls
[██████████] Applied layout/theme resolver
[██████████] Applied theme card
[██████████] Applied theme card wired into selector
[██████████] Theme token resolver
[██████████] Theme token card
[██████████] Theme token card wired into selector
[██████████] Dashboard style adapter
[██████████] Dashboard style adapter preview card
[██████████] Dashboard style adapter card wired into selector
[██████████] Selector save/apply feedback
[██████████] Custom request scaffold
[██████████] Custom request panel
[██████████] Custom request panel wired into selector
[██████████] Analytics event scaffold
[██████████] Style pack analytics wired
[██████████] Layout selector analytics wired
[██████████] Custom request analytics wired
[██████████] Analytics panel wired into selector
[██████████] Admin analytics summary helper
[██████████] Admin analytics summary card
[██████████] Admin analytics summary wired into selector
[██████████] Dashboard bridge helpers
[██████████] Studio card
[██████████] Launcher flow
[██████████] Dashboard route wrapper
[██████████] Surface width hook
[██████████] Barrel exports
[██████░░░░] Direct DashboardScreen view wiring pending
```

---

## Applied theme state

```text
saved layout preset
  + saved style pack preference
  + resolved accent colour
  + lock/edit state
  + surface labels
  + style pack tags
  -> applied UI layout theme
  -> theme tokens
  -> dashboard style adapter
```

The selector shows this state with:

```text
UiLayoutAppliedThemeCard
UiLayoutThemeTokenCard
UiLayoutDashboardStyleAdapterCard
```

This gives users a clear “what is currently active” view before they preview, save, apply packs or draft custom requests.

---

## Dashboard style adapter bridge

```text
applied theme
  -> theme tokens
  -> container style
  -> card style
  -> chip style
  -> text colours
  -> spacing rules
```

This is the next bridge into actual dashboard/widget/card rendering.

---

## Theme token bridge

```text
applied theme
  -> accent
  -> accentSoft
  -> border
  -> surface
  -> surfaceRaised
  -> glowShadow
  -> radiusMode
  -> density
```

These tokens are the next bridge into actual dashboard/card rendering style.

---

## Style pack flow

```text
Select layout preset
  -> preview app/tablet/web shells
  -> browse compatible style packs
  -> filter All / Free / Paid / Custom
  -> apply available pack
  -> save per user + role/audience
```

Locked/request-only packs are shown for future marketplace flow but cannot be applied yet.

Current style pack examples:

```text
Default Dark
Midnight Luxe
Obsidian Control
Royal Obsession
Neon Temptress
Cyber Vixen
Custom Tech Slave Build
```

---

## Custom request flow

```text
Choose layout preset
  -> choose/request custom style pack
  -> draft custom layout request
  -> review brand words, colour notes, modules and inspiration notes
  -> move request through draft / ready / submitted / parked
```

This is currently an in-memory scaffold. Later it should connect to:

```text
Style Marketplace
Tech Slave expression-of-interest flow
GitHub contributor workflow
creator/admin approval queue
quote/payment workflow
```

---

## Local analytics flow

The analytics scaffold currently records local in-memory events for:

```text
layout_preset_selected
layout_preset_saved
layout_lock_toggled
layout_reset
style_pack_applied
style_pack_custom_requested
custom_request_created
custom_request_status_changed
preview_focus_changed
```

The selector includes a `Show Analytics` toggle so the event stream can be inspected during local testing. When analytics are shown, the selector displays both:

```text
UiLayoutAdminAnalyticsSummaryCard
UiLayoutAnalyticsPanel
```

Later this should connect to backend analytics/event logging.

---

## Admin analytics summary

The admin summary helper rolls local events into:

```text
total event count
events by type
events by audience
latest events
most recent event timestamp
highlight labels for saved layouts, style packs and custom requests
```

This is the future bridge into Headmistress analytics and admin reporting.

---

## How it should be wired next

The next direct integration target is `frontend/src/features/dashboard/DashboardScreen.tsx`.

Use:

```ts
import { UiLayoutDashboardRoute } from '../ui-layouts/uiLayoutDashboardRoute';
```

Then render it when the dashboard view is `uiLayoutStudio`:

```tsx
if (activeView === 'uiLayoutStudio') {
  screen = (
    <UiLayoutDashboardRoute
      userId={dashboardUserId}
      role={currentUser?.role}
      onSaved={() => setNotice('UI layout preference saved.')}
    />
  );
}
```

See also:

```text
frontend/src/features/ui-layouts/DashboardScreenWiringPatch.md
docs/UNIVERSAL_UI_LAYOUT_SYSTEM.md
docs/UNIVERSAL_UI_LAYOUT_DASHBOARD_WIRING.md
docs/UI_LAYOUT_STUDIO_LOCAL_VERIFICATION_CHECKLIST.md
docs/UI_LAYOUT_STUDIO_PROGRESS_REPORT.md
```

---

## Design rule

Do not duplicate the entire web UI and app UI. Build shared components and let the selected layout preset plus responsive shell decide whether the user sees sidebar, rail, bottom tabs, stacked cards, grid cards or live-room mode.
