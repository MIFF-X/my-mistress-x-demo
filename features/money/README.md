# Money Feature Folder

This folder contains the money-in and money-out plugin screens for Mistress-X.

## Screens

```text
top-up-payment-options-placeholder.js
earnings-vault-placeholder.js
frontend/src/features/money/EarningsVaultScreen.tsx
```

## Current frontend status

```text
Top-Up Payment Options screen        ██████████ 100%
Earnings Vault screen                ██████████ 100%
Provider method placeholders          ██████████ 100%
Payout method placeholders            ██████████ 100%
Ledger flow notes                     ██████████ 100%
Real processor wiring                 ░░░░░░░░░░ pending
Ledger/database wiring                ░░░░░░░░░░ pending
Admin payout approval wiring          ██████████ 100%
Creator payout request UI             ██████████ 100%
Creator payout statement export       ██████████ 100%
```

## Top-Up Payment Options

Money-in plugin for users/Subs adding funds into the platform wallet.

Captured placeholder methods:

```text
Card Top-Up
Google Pay
Apple Pay
PayID Bank Transfer
Manual Payment Verification
Stripe Creator Monetisation Add-On
Adult-Friendly Processor Add-On
```

## Earnings Vault

Money-out plugin for Mistress earnings, payout profiles, cashout requests, reserves, batches, and payout history.

The app dashboard now includes a real creator-facing Earnings Vault route for Mistress, Headmistress, and Admin roles. It uses bearer-token API calls to load summary balances, payout options, saved payout methods, payout requests, and reserve holds. Creators can save payout methods and create cashout requests that feed the Headmistress payout request review queue.

The creator route now prefers the backend `GET earnings-vault/statement.csv` export for balance summary rows, saved payout methods, cashout requests, and reserve holds. The screen keeps a local CSV builder as a fallback, and can show the statement text, copy it in web builds, download it in web builds, or open the native share sheet on mobile builds.

Captured placeholder methods:

```text
Bank Account Cashout
PayID Cashout
Stripe Connect Payout
Adult-Friendly Processor Payout
Manual Bank Payout
```

## Backend still needed

```text
Payment provider API contracts
Wallet ledger service
Transaction status state machine
Manual payment verification queue
Payout profile service
Production payout approval execution beyond finance-decision audit logs, dashboard auto-review decisions, reserve hold case review, manual top-up verification queue, payout request review queue, draft batches, status controls, CSV exports, provider-neutral reconciliation, manual settlement evidence recording, pasted-row settlement import, and variance checks
Dispute reserve automation beyond hold-review reserve holds
Refund/reversal records
Audit logs
Admin reports
```

## Database still needed

```text
wallets
wallet_transactions
payment_methods
payment_attempts
manual_payment_reviews
payout_profiles
payout_requests
payout_batches
dispute_reserves
money_audit_logs
```
