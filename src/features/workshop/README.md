# Workshop Portal

This feature folder owns the web dashboard scaffold for workshop-style moderation, role-separated control panels, release/download pages and OAuth account-link patterns.

## Primary Screens

```text
WorkshopPortalScreen.tsx      Dashboard module for moderation queues, role panels, releases and OAuth links
workshopPortalModel.ts        Typed scaffold data for queue items, control panels, release channels and providers
```

## Connected Feature Ideas

```text
Workshop moderation queues for uploads, reports, comments, ratings, screenshots, releases and attachments
Admin control panel for users, news, uploads, releases, bans and IP lookup
Moderator control panel for workshop review, report triage, comment/rating decisions and screenshot review
Developer control panel for crash reports, diagnostics, release notes and installer artifact metadata
Download pages for official app installers, plugin releases, checksums, rollback files and release notes
OAuth connect/disconnect pattern for external providers, token scope review, revocation and audit history
```

## Production Follow-Up

```text
GET /workshop/moderation
POST /workshop/moderation/:id/decision
POST /workshop/uploads/:id/scan
GET /workshop/releases
POST /workshop/releases
POST /workshop/releases/:id/publish
POST /workshop/releases/:id/rollback
GET /workshop/oauth/providers
POST /workshop/oauth/providers/:id/connect
DELETE /workshop/oauth/providers/:id/disconnect
Admin/moderator/developer role guards and audit trails
```

## Local Verification

```text
npm run typecheck
```
