<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:2B0F3A,50:8B1E5A,100:D4AF37&height=140&section=header&text=Stickers%20%2F%20Sticker%20Packs&fontSize=34&fontColor=FFFFFF&animation=twinkling&fontAlignY=35&desc=Mistress-X%20collector%20albums%20%7C%20packs%20%7C%20drops%20%7C%20progress&descAlignY=58&descSize=13" alt="Animated Stickers / Sticker Packs README title" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Orbitron&size=18&duration=2800&pause=900&color=D4AF37&center=true&vCenter=true&width=720&lines=Create+stickers+%E2%86%92+build+packs+%E2%86%92+collect+sets;Monthly+drop+ready+collector+system;Sticker+albums+feed+profiles+and+rewards" alt="Animated stickers typing banner" />
</p>

# Stickers / Sticker Packs Feature

Frontend folder:

```text
frontend/src/features/stickers
```

Primary screens/components:

```text
StickerStudioScreen.tsx
StickerCollectionGrid.tsx
```

This folder owns the app-side collectible sticker system, including single sticker drops, user sticker albums, sticker packs, pack progress, and creator pack creation.

---

## Purpose

The sticker system is a collector layer for Mistress-X. It supports individual collectible stickers and grouped sticker packs/collections that Subs can complete over time.

The system is designed for:

```text
Mistress-created sticker drops
purchase/gift/collection mechanics
Sub sticker albums
pack progress tracking
completion rewards later
collectible item identity tied to platform activity
```

It also supports the locked collector rule that purchased physical/intimate inventory items may later have a matching digital sticker version tied to that exact item.

---

## Connected backend API

Frontend API client:

```text
frontend/src/api/stickersApi.ts
```

Backend module:

```text
backend/src/modules/stickers
```

Backend routes used by this feature include:

```text
GET  /api/stickers
POST /api/stickers
POST /api/stickers/collect
GET  /api/stickers/mine
POST /api/stickers/packs
GET  /api/stickers/packs
GET  /api/stickers/packs/:id/progress
POST /api/stickers/packs/:id/items
```

---

## Current UI features

### Sticker Studio tabs

```text
Market
My Album
Packs
Create Sticker
Create Pack
```

### Market

Shows released stickers and lets users collect/purchase them.

Sticker cards show:

```text
title
price/free status
creator id
owned quantity
rarity-style visual label
image placeholder/image-linked note
```

### My Album

Shows the current user's collected sticker types and quantities.

The album is the Sub-facing collector surface where completed sets can later connect to rewards, badges, trophies, leaderboard points, or profile showcase items.

### Packs

Shows active sticker packs and pack collection progress.

Pack cards show:

```text
pack title
theme
price/free status
description
creator id
collected count / total count
completion percentage
pack item rarity chips
owned/not-owned indicators
```

Users can check their pack progress using the backend progress endpoint.

### Create Sticker

Creator-only tab for:

```text
MISTRESS
HEADMISTRESS
ADMIN
```

Creates individual stickers with:

```text
title
optional image URL
optional price
metadata source: sticker-studio
```

### Create Pack

Creator-only tab for creating grouped sticker collections.

Pack creation fields:

```text
pack title
description
theme
optional price
selected stickers
```

The old comma-separated sticker ID field has been replaced with tap-to-select picker behaviour.

---

## Tap-to-select pack picker

The Create Pack screen now supports:

```text
Tap stickers to include them in the pack
Tap selected stickers again to remove them
Selected count shown
Selection order shown on each selected sticker
Selected stickers mapped to pack items after pack creation
```

Automatic rarity assignment:

```text
First selected sticker -> RARE
Every fourth selected sticker -> RARE
Every eighth selected sticker -> LEGENDARY
All others -> COMMON
```

This makes pack creation usable from the app UI without copying database IDs manually.

---

## Database concepts

Prisma models added for this system:

```text
StickerDefinition
UserSticker
StickerPack
StickerPackItem
UserStickerPackProgress
```

Important relationships:

```text
User.createdStickerPacks
User.stickerPackProgress
StickerDefinition.packItems
StickerPack.items
StickerPack.userProgress
```

---

## Related Command Centre surface

Admin/Headmistress sticker pack monitoring is handled in:

```text
frontend/src/features/admin/AdminCommandCentreScreen.tsx
```

Command Centre tab:

```text
Sticker Packs
```

The admin view shows:

```text
pack title
active/inactive status
theme
price
creator
item count
progress row count
description
rarity labels
created date
```

---

## Local verification checklist

After pulling the branch, run:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run build

cd ../frontend
npm install
npm run typecheck
npm run web
```

Then manually test:

```text
1. Login as Mistress/Admin.
2. Open Sticker Studio.
3. Create a few stickers.
4. Open Create Pack.
5. Tap stickers to select them.
6. Tap a selected sticker again to remove it.
7. Confirm selected count and order updates.
8. Create a pack.
9. Open Packs tab.
10. Check pack progress.
11. Login as Sub.
12. Collect/purchase stickers.
13. Re-check pack progress.
14. Open Command Centre as Headmistress/Admin.
15. Confirm Sticker Packs tab shows pack and item counts.
```

---

## Still to polish later

```text
real image upload / media picker
richer sticker image previews
cutout edge / white-border collectible style
pack cover images
completion rewards
pack badges/trophies
seasonal/monthly collection drops
leaderboard points for completion
automated sticker pack progress tests
```
