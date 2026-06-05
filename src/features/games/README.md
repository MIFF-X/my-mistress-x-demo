# Game Hub

The Game Hub feature folder tracks the clean-room scaffold for the quiz, emoji reaction and live-room overlay backlog extracted from the external artifacts.

## Primary Screens

```text
GameHubScreen.tsx      Dashboard module for quiz imports, hosted quizzes, favourites, history and live overlays
gameHubModel.ts        Typed scaffold data for adapters, game plans, reaction rooms, overlays and history events
```

## Connected Feature Ideas

```text
Kahoot-style quiz import adapter with PIN -> quiz ID resolution
Hosted quiz admin page, login gate, public play page, score tracking and question editor
Emoji reaction rooms with solo, multiplayer, lobby, waiting room, timers and keyboard-accessible controls
Game hub tabs for available games, favourite games, history logs and live overlays
Live-room overlays for trivia, raffles, scratch cards, bingo, spin wheel, dice, cards and hangman-style games
```

## Production Follow-Up

```text
Implemented first backend contract:
GET /games/hub/summary
GET /games/hub/history
GET /games/hub/favourites
POST /games/quiz/import
GET /games/quiz/imports
GET /games/quiz/imports/:id/logs
DELETE /games/quiz/imports/:id
Durable game_hub_quiz_imports storage and dashboard backlog display
POST /games/quizzes
GET /games/quizzes
GET /games/quizzes/:id
GET /games/quizzes/:id/diagnostics
GET /games/quizzes/:id/diagnostics?channel=&eventName=&roomId=&entryLimit=&receiptLimit=
POST /games/quizzes/:id/questions
POST /games/quizzes/:id/publish
POST /games/quizzes/:id/answers
GET /games/quizzes/:id/scores
GET /games/quizzes/:id/overlay-snapshot
POST /games/quizzes/:id/overlay-snapshot/dispatch
GET /games/quizzes/:id/overlay-receipts
gameHub.hostedQuizOverlaySnapshot client subscription
Durable hosted quiz definitions and score answers through game_hub_hosted_quizzes
Durable overlay socket receipts through game_hub_overlay_socket_receipts
Durable paid game entry entitlements through game_hub_game_entry_entitlements
Wallet debit and creator credit ledger rows for paid hosted quiz answer entry
Hosted quiz score snapshots shaped for live-room overlay events
Socket events gameHub.hostedQuizOverlaySnapshot, game_hub.hosted_quiz.join_overlay, game_hub.hosted_quiz.refresh_overlay, game_hub.hosted_quiz.overlay_snapshot and room:game_overlay_snapshot
Live-room clients subscribe to hosted quiz overlay socket events and render the latest scoreboard snapshot
Hosted quiz publish and answer flows refresh the room-scoped gameHub.hostedQuizOverlaySnapshot stream
Authenticated overlay receipt e2e covers dashboard dispatch and answer-broadcast diagnostics

POST /games/reactions/rooms
POST /games/reactions/rooms/:id/join
POST /games/reactions/rounds/:id/score
Durable reaction rooms, participants, rounds and score snapshots through game_hub_reaction_rooms
gameHub.reactionRoomOverlaySnapshot client subscription and receipt diagnostics
Wallet debit and creator credit ledger rows for paid reaction-room join entry
Authenticated games e2e coverage for paid entry entitlement denial, low-balance blocking and duplicate reaction-room join replay
Durable game_hub_overlay_socket_receipts delivery diagnostics for client snapshots and room broadcasts
Durable game_hub_hosted_quiz_entries for one-time paid entry entitlement plus wallet debits before answer scoring
Authenticated e2e coverage for hosted quiz low-balance guards, entitlement replay and overlay socket dispatch
Socket fanout for reaction-room scores through gameHub.reactionRoomOverlaySnapshot and room:game_overlay_snapshot
Owner/admin hosted quiz diagnostics for entry totals, entitlement rows and overlay delivery receipt rollups
Dashboard backlog rows can load hosted quiz diagnostics and reveal entry/receipt rollups
Authenticated reaction socket e2e for dashboard and live-room score channels
Dashboard regression coverage for diagnostics summaries, paid-entry labels and dispatch states
Hosted quiz diagnostics filters for deeper receipt slicing by event, channel, room and limits
Browser smoke targets exposed in the backend summary and dashboard for diagnostics, overlay dispatch and reaction fanout checks

Remaining production follow-up:
Browser smoke for Game Hub diagnostics and reaction overlay refresh when staging data is available
Live staging smoke coverage for paid hosted quiz and reaction-room entry after provider validation
Release-environment smoke for Mystery Box odds-history filters and Lotto draw/refund policy review data
```

## Local Verification

```text
npm run typecheck
```
