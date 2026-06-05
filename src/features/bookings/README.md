<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:2B0F3A,50:8B1E5A,100:D4AF37&height=140&section=header&text=Paid%20Calls%20%2F%20Bookings&fontSize=34&fontColor=FFFFFF&animation=fadeIn&fontAlignY=35&desc=Mistress-X%20booking%20lifecycle%20%7C%20calls%20%7C%20timers%20%7C%20wallet-ledger%20flow&descAlignY=58&descSize=13" alt="Animated Paid Calls / Bookings README title" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Orbitron&size=18&duration=2800&pause=900&color=D4AF37&center=true&vCenter=true&width=720&lines=Booking+requests+%E2%86%92+approval+%E2%86%92+active+session;Phone+and+video+call+monetisation+surface;Wallet-ledger+backed+booking+actions" alt="Animated bookings typing banner" />
</p>

# Paid Calls / Bookings Feature

Frontend folder:

```text
frontend/src/features/bookings
```

Primary screen:

```text
BookingsScreen.tsx
```

This folder owns the app-side paid call booking experience for phone and video sessions.

---

## Purpose

The Bookings feature lets a Sub request a paid phone/video session with a Mistress or Headmistress, then lets the host manage the booking lifecycle.

The flow is intentionally state-based so the app can safely control when each action appears.

```text
Sub requests booking -> PENDING
Host approves -> APPROVED
Host starts -> ACTIVE
Participant completes -> COMPLETED
Participant cancels before completion -> CANCELLED
Participant extends only while ACTIVE
```

---

## Connected backend API

Frontend API client:

```text
frontend/src/api/bookingsApi.ts
```

Backend module:

```text
backend/src/modules/bookings
```

Backend routes used by this screen:

```text
GET   /api/bookings
POST  /api/bookings
PATCH /api/bookings/approve
PATCH /api/bookings/start
PATCH /api/bookings/complete
PATCH /api/bookings/cancel
POST  /api/bookings/extend
```

---

## Current UI features

### Booking list

The list supports status filters with counts:

```text
All
Pending
Approved
Active
Completed
Cancelled
```

New booking requests automatically switch the list to `PENDING` so the user sees the created request immediately.

### Role/status actions

Buttons are shown only when allowed:

```text
Host + PENDING -> Approve
Host + APPROVED -> Start
Participant + ACTIVE -> Complete
Participant + ACTIVE -> Extend +5
Participant + not COMPLETED/CANCELLED -> Cancel
```

### Host selector

The request form loads potential hosts from the user directory:

```text
MISTRESS
HEADMISTRESS
```

The selector includes:

```text
search hosts
selected host card
host chips
current-user filtering to reduce self-booking mistakes
```

### Schedule picker

The request form now avoids raw ISO-only entry and supports:

```text
Now / unscheduled
Choose date & time
Quick date chips: Today, Tomorrow, +2 days, +3 days, +7 days
Quick time chips: 09:00, 12:00, 15:00, 18:00, 20:00, 22:00
Editable date field: YYYY-MM-DD
Editable time field: HH:mm
Readable schedule preview
Generated ISO timestamp preview
Invalid date/time validation
```

When the user chooses `Now / unscheduled`, no scheduled timestamp is sent.

When the user chooses `Choose date & time`, the local date/time is converted to an ISO timestamp for backend storage.

### Timer/scheduling display

Booking cards display helpful timing text:

```text
APPROVED + scheduledAt -> Scheduled in / Scheduled time passed
ACTIVE + startedAt -> Live now, elapsed time, approximate remaining time
COMPLETED/CANCELLED + endedAt -> completed/cancelled timestamp
```

---

## Wallet behaviour

Booking creation and active booking extension are charged through the backend wallet ledger using transaction type:

```text
CALL_BOOKING
```

The frontend does not calculate final ledger effects directly. It sends the booking/extension request and lets the backend wallet service act as the source of truth.

---

## Related Command Centre surface

Admin/Headmistress booking monitoring is handled in:

```text
frontend/src/features/admin/AdminCommandCentreScreen.tsx
```

Command Centre tab:

```text
Bookings
```

The admin view shows booking type, status, price, duration, Sub, Host, scheduled time, created time, and notes.

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
1. Login as Sub.
2. Open Paid Calls / Bookings.
3. Request a VIDEO booking using a host chip.
4. Try Now / unscheduled.
5. Try Choose date & time with quick date and time chips.
6. Confirm invalid date/time shows validation.
7. Confirm new request appears under Pending.
8. Login as host/Mistress.
9. Approve booking.
10. Start booking.
11. Confirm active timer text appears.
12. Extend +5.
13. Complete booking.
14. Confirm Completed filter count updates.
```

---

## Still to polish later

```text
Native mobile date/time picker integration
Host availability windows
Calendar conflict checking
Booking reminders and push notifications
Live call/video provider wiring
Automated booking lifecycle tests
```
