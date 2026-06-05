# Middleware Layout

`frontend/middleware` contains runtime glue and integration logic.

Examples:
- monetization API wrappers (`middleware/monetization/api/*`)
- monetization socket/event handlers (`middleware/monetization/sockets/*`)
- registries/orchestration files (`middleware/monetization/*`)

These files are **not plugin UI modules** and should remain under `middleware/`, not `plugins/`.
