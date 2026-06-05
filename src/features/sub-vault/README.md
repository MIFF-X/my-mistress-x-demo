# Sub Vault / Verification Vault Feature

Frontend folder:

```text
frontend/src/features/sub-vault
```

This screen is the separate Sub-side vault scaffold. It is not marketplace `PRIVATE_VAULT`.
Backend records are now Prisma-backed for reference items, shares, audit logs, and review states.

## Current frontend support

```text
Create consented provider-safe reference records.
Show persisted status, consent version, submitted/reviewed/revoked timestamps, reviewer id, and review notes.
Manage per-item share recipients instead of one global share input.
Submit draft records for Headmistress/Admin review.
Review queue supports per-item notes before verify/reject decisions.
Revoke owner-held items and clear sharing through the backend.
```

## Safety boundaries

```text
No raw passwords, logins, bank PINs, SSNs, coercive leverage, or blackmail material.
Evidence is represented by provider-safe references only.
Consent must be explicit and revocable.
Revocation clears sharing.
Headmistress/Admin review is separate from marketplace product sales.
```

## Connected backend routes

```text
GET  /api/sub-vault/mine
GET  /api/sub-vault/shared-with-me
GET  /api/sub-vault/review-queue
POST /api/sub-vault/items
PATCH /api/sub-vault/items/:itemId/share
POST /api/sub-vault/items/:itemId/submit
POST /api/sub-vault/items/:itemId/revoke
POST /api/sub-vault/items/:itemId/review
```

## Latest local result, 2026-05-15

```text
frontend typecheck: pass
Sub Vault share/review management polish: locally verified
```
