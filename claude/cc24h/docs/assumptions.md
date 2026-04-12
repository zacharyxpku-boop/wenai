# cc24h Assumptions & Known Constraints

## Environment Assumptions

1. **Node.js 20+** is installed and working (tested with v24.14.0)
2. **Git** is installed and on PATH
3. **Claude CLI** is installed and authenticated (`claude --version` works)
4. Python is NOT required (original spec called for Python+Textual, but Python installation on this machine is corrupted — adapted to Node.js+blessed)

## Design Decisions

1. **sql.js over better-sqlite3**: Chose pure JS SQLite to avoid native compilation dependency (node-gyp requires Python which is broken)
2. **blessed over Textual**: Equivalent TUI capability in Node.js ecosystem
3. **CLI backend as primary**: Agent SDK is optional; system degrades gracefully without it
4. **File-based handoffs**: YAML files in addition to DB for human readability and git-trackability
5. **Single-process orchestrator**: Tasks run as child processes of the orchestrator, not as separate daemons

## Known Limitations

### Machine Environment
- **Windows sleep/hibernate**: If the machine sleeps, the daemon pauses. No wake-on-schedule capability. Disable sleep for night runs.
- **Terminal closure**: Closing the terminal kills the daemon. Use `start /B` or a terminal multiplexer for background execution.
- **API auth expiry**: If Anthropic API key expires during a long run, tasks will fail. No auto-refresh capability.

### System Design
- **Single machine only**: No distributed orchestration. All state is local.
- **No real-time conflict detection during execution**: Lock checking happens at task start, not continuously during execution.
- **Worktree requires git**: Non-git projects get no parallel isolation. Tasks run serially in same directory.
- **No cost tracking**: Token/API usage is not monitored. Use Anthropic dashboard for billing.
- **No Slack/email notifications**: Only file-based logging. Future enhancement.

### Claude CLI Constraints
- **--dangerously-skip-permissions**: Required for unattended operation. Run in isolated environment.
- **Context window**: Long tasks may hit context limits. Claude Code's built-in compact handles this, but very long tasks may lose early context.
- **Rate limits**: Concurrent tasks may hit API rate limits. Adjust `max_parallel` accordingly.

## Security Considerations

- The daemon runs `claude --dangerously-skip-permissions` which allows arbitrary command execution
- Run in an isolated environment (VM, container) for safety
- Never run against production codebases without review
- All task branches should be reviewed before merging to main
