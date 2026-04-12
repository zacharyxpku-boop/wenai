---
paths:
  - "src/tui/**"
---

# TUI Conventions

- Uses blessed library for terminal UI
- Keep panels simple: tables and text boxes
- Colors: green=success, red=fail, yellow=warning, cyan=info
- Status bar at top, hotkey bar at bottom
- All data from system object (db queries), no external API calls
- Refresh interval: 2 seconds for active panels
