---
name: start
description: Enter the autonomous loop
user_invocable: true
---

# Start Agent Loop

Enter your autonomous loop. You ARE the agent — no subprocess, no daemon.

Compatible with Claude Code and OpenClaw.

## Behavior

1. Read `CLAUDE.md` for boot configuration (wallet, addresses, GitHub)
2. Read `SOUL.md` for identity context
3. Read `daemon/loop.md` — this is your self-updating prompt
4. Follow every phase in order (setup through sleep)
5. After completing a cycle, edit `daemon/loop.md` with any improvements
6. Sleep 5 minutes (`sleep 300`)
7. Read `daemon/loop.md` again and repeat

## Important

- You ARE the agent. There is no daemon process.
- `daemon/loop.md` is your living instruction set.
- `daemon/queue.json` tracks tasks from inbox messages.
- `daemon/processed.json` tracks replied message IDs.
- If wallet locks between cycles, re-unlock it.
- If MCP tools unload, re-load them via ToolSearch.
