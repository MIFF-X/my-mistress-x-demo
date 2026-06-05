# DashboardScreen UI Layout Studio Wiring Patch

Branch: `feature/abacus-ai-build`

This patch note records the exact safe code edits needed to make the already-registered `uiLayoutStudio` dashboard widget open the real selector route.

## 1. Import the route

In `frontend/src/features/dashboard/DashboardScreen.tsx`, add this import near the other feature imports:

```ts
import { UiLayoutDashboardRoute } from '../ui-layouts/uiLayoutDashboardRoute';
```

## 2. Add the local DashboardView union value

In the local `type DashboardView = ...` union, add:

```ts
| 'uiLayoutStudio'
```

Recommended placement:

```ts
| 'stylePacks'
| 'uiLayoutStudio'
| 'subVault'
```

## 3. Add the module definition

Inside the `MODULES` object, after `stylePacks`, add:

```ts
uiLayoutStudio: {
  title: 'UI Layout Studio',
  subtitle: 'Choose web/app dashboard layouts, responsive shells and style modes',
  visual: 'uiLayoutStudio',
  view: 'uiLayoutStudio',
  badgeOverride: 'LAYOUT',
},
```

## 4. Add module placement

Add `MODULES.uiLayoutStudio` into these section item arrays:

- Admin/Headmistress `Marketplace` section, near `MODULES.stylePacks`
- Mistress `Marketplace` section, near `MODULES.stylePacks`
- Sub `Profile` section, near `MODULES.profile`

## 5. Render the route

Inside `renderActiveScreen()`, add:

```tsx
if (activeView === 'uiLayoutStudio') {
  screen = (
    <UiLayoutDashboardRoute
      userId={dashboardUserId}
      role={currentUser?.role}
      width={390}
      onSaved={() => setNotice('UI layout preference saved.')}
    />
  );
}
```

## Current connected pieces

```text
frontend/src/features/ui-layouts/layoutPresets.ts
frontend/src/features/ui-layouts/responsiveDashboardShell.ts
frontend/src/features/ui-layouts/layoutSelectorCopy.ts
frontend/src/features/ui-layouts/uiLayoutStore.ts
frontend/src/features/ui-layouts/UiLayoutSelectorScreen.tsx
frontend/src/features/ui-layouts/UiLayoutStudioCard.tsx
frontend/src/features/ui-layouts/UiLayoutStudioLauncher.tsx
frontend/src/features/ui-layouts/uiLayoutDashboardRoute.tsx
frontend/src/features/ui-layouts/dashboardUiLayoutBridge.ts
frontend/src/features/dashboard/widgets/dashboardWidgetRegistry.ts
frontend/src/features/buttons/ActionButtonPack.ts
```

## Status

```text
[██████████] Widget registry value exists
[██████████] Action button value exists
[██████████] Route wrapper exists
[██████████] Wiring patch documented
[██░░░░░░░░] Direct DashboardScreen code patch pending
```
