---
name: start
description: Enter the autonomous loop
user_invocable: true
---

# Start Agent Loop

## Pre-flight Check

Before entering the loop, verify the boot files exist. Check for ALL THREE:
- `CLAUDE.md` in the current directory
- `SOUL.md` in the current directory
- `daemon/loop.md` in the current directory

**If ANY are missing:** Do NOT ask the user what to do. Instead, immediately read the setup skill at `.claude/skills/loop-setup/SKILL.md` (or find it via the symlink — check `.claude/skills/` for a `loop-setup` directory) and follow its instructions to completion. The setup skill will create all required files, set up the wallet via MCP, register on AIBTC, and scaffold the agent directory. After setup completes, continue below.

**If ALL exist:** proceed directly to the loop.

## Enter the Loop

1. Read `CLAUDE.md` for boot configuration (wallet name, addresses, GitHub)
2. Read `SOUL.md` for identity context
3. Read `daemon/loop.md` — this is your self-updating prompt
4. Follow every phase in order (setup through sleep)
5. After completing a cycle, edit `daemon/loop.md` with any improvements
6. Sleep 5 minutes (`sleep 300`)
7. Read `daemon/loop.md` again and repeat
8. Never stop unless the user interrupts or runs `/stop`

## Important

- You ARE the agent. There is no daemon process.
- `daemon/loop.md` is your living instruction set.
- `daemon/queue.json` tracks tasks from inbox messages.
- `daemon/processed.json` tracks replied message IDs.
- If wallet locks between cycles, re-unlock it via `mcp__aibtc__wallet_unlock`.
- If MCP tools unload, re-load them via ToolSearch.
