<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:050505,45:8B1E5A,100:D4AF37&height=130&section=header&text=Admin%20Member%20Feature&fontSize=34&fontColor=FFFFFF&animation=twinkling&fontAlignY=38&desc=Admin%20Member%20%2B%20%7C%20Admin%20Messages%20%7C%20Trusted%20Members&descAlignY=62&descSize=13" alt="Admin Member Feature" />
</p>

# Admin Member + Feature README

Branch: `feature/abacus-ai-build`

This README documents the frontend scaffold for the Admin Member +, Admin Messages, and Mistress Trusted Member feature stream.

---

## Purpose

```text
Headmistress
  -> adds Admin Members
  -> assigns roles/jobs/zones
  -> coordinates via Admin Messages

Mistress
  -> adds trusted profile helpers
  -> assigns creator/profile jobs only
  -> does not grant platform admin access
```

---

## Source files

```text
adminMemberDelegationModels.ts
adminMessagesModels.ts
AdminMemberPlusPanel.tsx
AdminMessagesPanel.tsx
AdminMemberDelegationScreen.tsx
```

---

## Current UI pieces

```text
AdminMemberPlusPanel
  -> role template picker
  -> draft assignment creation
  -> activate / pause / remove status controls
  -> permission chips
  -> boundary warning

AdminMessagesPanel
  -> thread list
  -> urgency filters
  -> unread filter
  -> new thread action
  -> send update action
  -> mark read action
  -> current thread message view

AdminMemberDelegationScreen
  -> Headmistress Admin Members tab
  -> Mistress Trusted Members tab
  -> permission boundary explanation
```

---

## Role templates

Platform Admin Members:

```text
Moderation Admin
Finance Admin
Live Room Admin
Content Review Admin
Support Admin
Marketplace Admin
Growth Admin
```

Mistress Trusted Members:

```text
Profile Manager
Message Assistant
Store Assistant
Content Assistant
Live Assistant
Growth Assistant
```

---

## Permission boundary

```text
Headmistress Admin Members = platform helpers.
Mistress Trusted Members = creator/profile helpers only.
```

A Mistress trusted member cannot become a platform Admin Member unless the Headmistress adds them through Admin Member +.

---

## Dashboard wiring

Local patch scripts:

```text
scripts/patch-admin-member-delegation-dashboard.mjs
scripts/patch-admin-member-delegation-dashboard.ps1
```

Windows command:

```powershell
cd C:\Users\Guest1\MY-MISTRESS-X
git pull origin feature/abacus-ai-build
powershell -ExecutionPolicy Bypass -File .\scripts\patch-admin-member-delegation-dashboard.ps1
cd frontend
npm run typecheck
```

---

## Progress

```text
[██████████] Models
[██████████] Admin Member + panel
[██████████] Admin Messages panel
[██████████] Combined delegation screen
[██████████] Patch scripts
[██████░░░░] Local DashboardScreen patch
[██░░░░░░░░] Runtime verification
```
