<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:12081F,45:8B1E5A,100:D4AF37&height=140&section=header&text=Frontend%20API%20Clients&fontSize=34&fontColor=FFFFFF&animation=fadeIn&fontAlignY=36&desc=Bearer-token%20requests%20%7C%20backend%20contracts%20%7C%20wallet-ledger%20source%20of%20truth&descAlignY=60&descSize=13" alt="Mistress-X inspired Frontend API README title" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Orbitron&size=18&duration=2800&pause=900&color=D4AF37&center=true&vCenter=true&width=840&lines=API+clients+bridge+screens+to+backend+modules;Money-moving+flows+must+stay+server-authoritative;Keep+types+aligned+with+NestJS+and+Prisma+contracts" alt="Mistress-X frontend API typing banner" />
</p>

# Frontend API Clients

This folder contains frontend API clients used by feature screens.

## Purpose

```text
centralise request helpers
keep bearer-token API calls consistent
avoid fake x-user-id or body userId money-moving patterns
map frontend screens to backend routes
```

## Expected client areas

```text
admin
bookings
marketplace
money
top-ups
plugins
ppv
stickers
wallet
chat
live rooms
room monitor
```

## Implemented money clients

```text
walletApi.ts     balance, ledger rows, wallet-screen top-up handoff
topUpsApi.ts     intents, receipts, manual verification queue, provider readiness
adminEconomyApi.ts Headmistress bank, reserves, payout health, provider readiness, payout review
adminMemberDelegationApi.ts Admin Member +, Trusted Member + and Admin Messages persistence
moneyApi.ts      earnings vault, payout accounts, reserves, statement export
```

## API rules

```text
1. Use shared bearer-token request helpers where available.
2. Let backend services remain the source of truth for wallet, ledger, unlocks, approvals, and entitlement logic.
3. Keep DTO/type changes reflected in related feature README files.
4. Do not duplicate business rules in screens if the backend owns them.
```

## Related docs

```text
frontend/src/features/README.md
backend/README.md
backend/prisma/README.md
docs/README_INDEX.md
```
