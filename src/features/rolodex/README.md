# Rolodex / Little Black Book Feature

Frontend folder:

```text
frontend/src/features/rolodex
```

## Screens

```text
RolodexScreen.tsx
LittleBlackBookScreen.tsx
```

## Little Black Book

The Little Black Book is the Sub-side mirror of the Mistress Rolodex. It stores private Mistress cards owned by the current user.

Fields include:

```text
Mistress user id
Mistress display name
CRM category
CRM status
rating
last contact date
recent interaction summary
relationship status
subscription status
contract status
tribute summary
private notes
favorite tags
shared Sub Vault item ids
```

Current scaffold:

```text
stats: total, active, VIP, archived, newest contact
tabs: all contacts, VIP, suppliers, business, personal, archived
filters: search, category, status, rating
contact rows: category, status, last contact, rating, action placeholders
right rail: network overview, quick actions, recent interactions
```

Connected routes:

```text
GET  /api/rolodex/little-black-book
POST /api/rolodex/little-black-book
DELETE /api/rolodex/:id
```

Next backend routes still needed:

```text
PATCH /api/rolodex/little-black-book/:id/archive
POST  /api/rolodex/little-black-book/import
GET   /api/rolodex/little-black-book/export
POST  /api/rolodex/little-black-book/merge-duplicates
```
