# Keeper & Allowance Wallet Feature

Frontend folder:

```text
frontend/src/features/keeper
```

Primary screen:

```text
KeeperAllowanceScreen.tsx
```

This is the scaffold for Keeper Agreements and Allowance Wallets.

## Current scaffold

```text
Keeper agreement cards
clear offer / renewal / visibility / cancellation terms
timestamped consent display
allowed category chips
allowance wallet sub-ledger rows
spending caps, remaining balances, expiry, and warnings
goal-specific Keeper roles
pin-money recurring support reminders
adopt-an-expense safe-category review placeholder
receipt / reminder actions
consent and audit timeline
```

## Access rule

The dashboard exposes this screen to:

```text
HEADMISTRESS
ADMIN
MISTRESS
SUB
```

The production version should apply role-specific actions:

```text
Mistress/Admin: create, revise, pause, review, export
Sub: accept, decline, cancel renewal, view receipts
Headmistress/Admin: audit, override where policy allows, export
```

## Production follow-up

```text
KeeperAgreement database table
AllowanceWallet sub-ledger table
Allowance spend authorization checks
Allowed-category policy enforcement
Renewal and cancellation routes
Timestamped consent records
Receipt rows and exports
Admin audit events
Goal-specific Keeper role persistence
Tax/accounting warnings and statement hooks
```
