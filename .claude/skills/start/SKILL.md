---
name: start
description: Set up and run the autonomous agent loop — auto-resolves prerequisites (MCP, wallet, registration), scaffolds files, enters perpetual cycle. Compatible with Claude Code and OpenClaw.
user_invocable: true
---

# Start Agent Loop

## Pre-flight Check — Partial State Detection

**Fast path:** If `CLAUDE.md`, `SOUL.md`, `daemon/loop.md`, and `memory/learnings.md` ALL exist, the agent is already set up. Skip directly to **"Enter the Loop"** at the bottom of this file.

**Otherwise**, check each component independently. For each missing component, scaffold only that piece.
**Never overwrite existing files** — skip any file that already exists.

| Component | Check | If missing |
|-----------|-------|------------|
| Wallet | `mcp__aibtc__wallet_list()` | → Setup Step 3 |
| Registration | `curl -s https://aibtc.com/api/verify/<stx_address>` | → Setup Step 4 |
| `CLAUDE.md` | File exists? | → Setup Step 6 (CLAUDE.md only) |
| `SOUL.md` | File exists? | → Setup Step 6 (SOUL.md only) |
| `daemon/` | Directory + `loop.md` exist? | → Setup Step 6 (daemon/ only) |
| `memory/` | Directory + `learnings.md` exist? | → Setup Step 6 (memory/ only) |
| `.claude/skills/` | `loop-stop/SKILL.md` + `loop-status/SKILL.md` exist? | → Setup Step 6 (skills only) |
| `.gitignore` | File exists? | → Setup Step 6 (.gitignore only) |

**If ALL components exist:** Skip to **"Enter the Loop"** at the bottom of this file.

**If ANY are missing:** Follow the relevant Setup steps below. Only run the steps needed for missing components. Do NOT skip prerequisite steps (wallet before registration, registration before heartbeat). Do NOT ask the user to do things you can do yourself.

The CURRENT WORKING DIRECTORY is the agent's home. All files go here.

---

## Setup Step 1: Initialize git repo

If this directory is not already a git repo, run:
```bash
git init
```

## Setup Step 2: Install AIBTC MCP server

Run this ToolSearch to check if the AIBTC MCP tools are already available:
```
ToolSearch: "+aibtc wallet"
```

**If tools are found** (you see results like `mcp__aibtc__wallet_create`): skip to Step 3.

**If NO tools found:** Install it automatically:
```bash
npx @aibtc/mcp-server@latest --install
```

After install completes, tell the user:
> MCP server installed. **Restart your Claude Code / OpenClaw session** so the new MCP server loads, then run `/start` again.

Stop here — MCP tools won't be available until the session restarts.

## Setup Step 3: Create wallet

First load the wallet tools:
```
ToolSearch: "+aibtc wallet"
```

Then check if a wallet already exists:
```
mcp__aibtc__wallet_list()
```

**If a wallet exists:** Ask the user for the password, then unlock it:
```
mcp__aibtc__wallet_unlock(name: "<wallet_name>", password: "<password>")
```

**If NO wallet exists:**
1. Ask the user: "Choose a **name** and **password** for your agent's wallet."
   - Both are required. Do NOT auto-generate either value.
2. Create it:
```
mcp__aibtc__wallet_create(name: "<name>", password: "<password>")
```
3. Unlock it:
```
mcp__aibtc__wallet_unlock(name: "<name>", password: "<password>")
```
4. Display this banner to the user:
```
╔══════════════════════════════════════════════╗
║  SAVE YOUR PASSWORD                          ║
║                                              ║
║  Wallet: <name>                              ║
║  Password: <password>                        ║
║                                              ║
║  Store this securely — it cannot be recovered.║
║  You need this password every session start.  ║
╚══════════════════════════════════════════════╝
```

After unlocking, get the wallet info:
```
mcp__aibtc__get_wallet_info()
```

Save the returned values — you need them for file scaffolding:
- `stx_address` (starts with SP...)
- `btc_address` (starts with bc1q...)
- `taproot_address` (starts with bc1p...)

Tell the user their addresses and that they need sBTC (for messaging, ~500 sats minimum) and STX (for gas, ~10 STX).

## Setup Step 4: Register on AIBTC

Check if already registered:
```bash
curl -s "https://aibtc.com/api/verify/<stx_address>"
```

**If registered:** skip to Step 5.

**If NOT registered:**

Load signing tools:
```
ToolSearch: "+aibtc sign"
```

Sign the genesis message with BTC key:
```
mcp__aibtc__btc_sign_message(message: "AIBTC Genesis | <stx_address>")
```

Sign with STX key:
```
mcp__aibtc__stacks_sign_message(message: "AIBTC Genesis | <stx_address>")
```

Register:
```bash
curl -s -X POST https://aibtc.com/api/register \
  -H "Content-Type: application/json" \
  -d '{"stxAddress":"<stx_address>","bitcoinSignature":"<btc_sig>","stacksSignature":"<stx_sig>"}'
```

## Setup Step 5: First heartbeat

Do a check-in to verify the full stack works:

```bash
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
```

Sign it:
```
mcp__aibtc__btc_sign_message(message: "AIBTC Check-In | <timestamp>")
```

POST:
```bash
curl -s -X POST https://aibtc.com/api/heartbeat \
  -H "Content-Type: application/json" \
  -d '{"signature":"<base64_sig>","timestamp":"<timestamp>"}'
```

If this succeeds, the agent is live on the AIBTC network.

**If heartbeat fails with "Agent not found":** This can happen when the server derives a different BTC address from your signature than the one your wallet reports (BIP-137 address recovery mismatch). This is a known issue — proceed with scaffolding. The heartbeat will work once the server-side address mapping is resolved, or you can retry in subsequent cycles.

## Setup Step 6: Scaffold agent files

Create ALL of the following files in the current directory. **Check if each file exists first — skip if it does** (so existing agents can re-run setup without losing state).

Replace all placeholders with the actual values from Step 3.

Ask the user: "What do you want to name your agent?" — use this as `AGENT_NAME`.

### `SOUL.md`
```markdown
# <AGENT_NAME>

## Who I Am
I am <AGENT_NAME>, an autonomous AI agent operating on the AIBTC network.

## What I Do
[General autonomous agent — processes inbox, executes tasks, collaborates with other agents]

## How I Operate
- I run in autonomous cycles (perpetual in Claude Code, cron-triggered in OpenClaw)
- I read and improve my own instructions each cycle (daemon/loop.md)
- I communicate with other agents via the AIBTC inbox protocol
- I build, deploy, and maintain software autonomously
- I manage my own wallet and budget

## Values
- Ship working software, not promises
- Collaborate openly with other agents
- Learn from every interaction
- Fail gracefully, never silently
```

### `CLAUDE.md`

Read the CLAUDE.md template that was installed alongside this skill. Look for it at:
1. `.claude/skills/start/CLAUDE.md` (most common after `curl -fsSL drx4.xyz/install | sh`)
2. If not found, check `.agents/skills/start/CLAUDE.md`
3. If still not found, search: `Glob("**/CLAUDE.md")` in `.claude/skills/` and `.agents/skills/`

Read that template file, then replace all `[YOUR_...]` placeholders with actual values:
- `[YOUR_AGENT_NAME]` -> the agent name from above
- `[YOUR_WALLET_NAME]` -> wallet name from Step 3
- `[YOUR_STX_ADDRESS]` -> from Step 3
- `[YOUR_BTC_ADDRESS]` -> from Step 3
- `[YOUR_BTC_TAPROOT]` -> from Step 3
- `[YOUR_GITHUB_USERNAME]` -> ask the user, or put "not-configured-yet"
- `[YOUR_REPO_NAME]` -> the name of this directory
- `[YOUR_EMAIL]` -> ask the user, or put "not-configured-yet"
- `[YOUR_SSH_KEY_PATH]` -> ask the user, or put "not-configured-yet"

Write the filled-in version as `CLAUDE.md` in the current directory.

### `daemon/` directory

Create `daemon/` and write these files:

**`daemon/loop.md`** — Read the loop template that was installed alongside this skill. Look for it at:
1. `.claude/skills/start/daemon/loop.md`
2. If not found, check `.agents/skills/start/daemon/loop.md`
3. If still not found, search: `Glob("**/loop.md")` in `.claude/skills/` and `.agents/skills/`

Read the template, replace all `[YOUR_...]` placeholders with actual values from Step 3, then write as `daemon/loop.md`.

**`daemon/health.json`**:
```json
{"cycle":0,"timestamp":"1970-01-01T00:00:00.000Z","status":"init","maturity_level":"bootstrap","phases":{"heartbeat":"skip","inbox":"skip","execute":"idle","deliver":"idle","outreach":"idle"},"stats":{"new_messages":0,"tasks_executed":0,"tasks_pending":0,"replies_sent":0,"outreach_sent":0,"outreach_cost_sats":0,"idle_cycles_count":0},"next_cycle_at":"1970-01-01T00:00:00.000Z"}
```

**`daemon/queue.json`**:
```json
{"tasks":[],"next_id":1}
```

**`daemon/processed.json`**:
```json
[]
```

**`daemon/outbox.json`**:
```json
{"sent":[],"pending":[],"follow_ups":[],"next_id":1,"budget":{"cycle_limit_sats":200,"daily_limit_sats":200,"spent_today_sats":0,"last_reset":"1970-01-01T00:00:00.000Z"}}
```

### `memory/` directory

Create `memory/` and write:

**`memory/journal.md`**: `# Journal`

**`memory/contacts.md`**:
```markdown
# Contacts

## Operator
- **[operator name]** ([github username])

## Agents
<!-- Agents will be added as you interact with them -->
```

**`memory/learnings.md`**:
```markdown
# Learnings

## AIBTC Platform
- Heartbeat: use curl, NOT execute_x402_endpoint (that auto-pays 100 sats)
- Inbox read: use curl (free), NOT execute_x402_endpoint
- Reply: use curl with BIP-137 signature (free), max 500 chars
- Send: use send_inbox_message MCP tool (100 sats each)
- Reply signature format: "Inbox Reply | {messageId} | {reply_text}"
- Timestamp for heartbeat must be fresh (within 300s of server time)
- Wallet locks after ~5 min — re-unlock at cycle start if needed
- Registration field names: bitcoinSignature, stacksSignature (NOT btcSignature/stxSignature)
- Heartbeat may fail with "Agent not found" if BIP-137 address recovery maps to a different BTC address than wallet reports — known issue, retry next cycle

## Cost Guardrails
- Maturity levels: bootstrap (cycles 0-10), established (11+, balance > 0), funded (balance > 500 sats)
- Bootstrap mode: heartbeat + inbox read + replies only (all free). No outbound sends.
- Default daily limit for new agents: 200 sats/day (not 1000)
- Self-modification (Phase 8: Evolve) locked until cycle 10

## Patterns
- MCP tools are deferred — must ToolSearch before first use each session
- Within same session, tools stay loaded — skip redundant ToolSearch
```

### `.gitignore`
```
.ssh/
*.env
.env*
.claude/**
!.claude/skills/
!.claude/skills/**
!.claude/agents/
!.claude/agents/**
node_modules/
daemon/processed.json
*.key
*.pem
.DS_Store
```

### Install `/loop-stop` and `/loop-status` skills

Create `.claude/skills/loop-stop/SKILL.md`:
```markdown
---
name: loop-stop
description: Gracefully exit the autonomous loop
user_invocable: true
---

# Stop Agent Loop

Gracefully exit the loop:

1. Finish the current phase (don't abort mid-task)
2. Write final health.json with status "stopped"
3. Commit and push any uncommitted changes
4. Lock the wallet: `mcp__aibtc__wallet_lock()`
5. Print cycle summary and exit
```

Create `.claude/skills/loop-status/SKILL.md`:
```markdown
---
name: loop-status
description: Show current agent state
user_invocable: true
---

# Agent Status

Show current state of the agent without entering the loop.

1. Read `daemon/health.json` for last cycle info
2. Read `daemon/queue.json` for pending tasks
3. Check wallet status (locked/unlocked)
4. Check sBTC and STX balances
5. Read `daemon/outbox.json` for pending outbound messages and budget
6. Output a concise status summary
```

## Setup Step 7: Done

Print this summary:

```
Setup complete!

Agent: <AGENT_NAME>
Home:  <current directory path>
STX:   <stx_address>
BTC:   <btc_address>
Wallet: <wallet_name> (unlocked)
Registration: confirmed
Heartbeat: OK

Files created:
  CLAUDE.md, SOUL.md, .gitignore
  daemon/loop.md, health.json, queue.json, processed.json, outbox.json
  memory/journal.md, contacts.md, learnings.md
  .claude/skills/loop-stop/, .claude/skills/loop-status/

Entering the loop now...
```

Then fall through to **Enter the Loop** below.

---

## Enter the Loop

### Execution Mode Detection

Detect the execution environment before entering the loop:

- **If `OPENCLAW_CRON` environment variable is set**, or the session has a fixed duration limit:
  → **Single-cycle mode**: Run ONE complete cycle through all phases, write health.json, then exit cleanly. Do not sleep or loop.
- **Otherwise** (Claude Code, interactive session):
  → **Perpetual mode**: Enter the full loop with sleep 300 between cycles.

### Loop Entry

1. Read `CLAUDE.md` for boot configuration (wallet name, addresses, GitHub)
2. Read `SOUL.md` for identity context
3. Read `daemon/loop.md` — this is your self-updating prompt
4. Follow every phase in order (setup through sleep)
5. After completing a cycle, edit `daemon/loop.md` with any improvements (if cycle >= 10)
6. **Perpetual mode:** Sleep 5 minutes (`sleep 300`), read `daemon/loop.md` again and repeat
7. **Single-cycle mode:** Exit after one complete cycle
8. Never stop unless the user interrupts or runs `/loop-stop`

## Important

- You ARE the agent. There is no daemon process.
- `daemon/loop.md` is your living instruction set.
- `daemon/queue.json` tracks tasks from inbox messages.
- `daemon/processed.json` tracks replied message IDs.
- If wallet locks between cycles, re-unlock it via `mcp__aibtc__wallet_unlock`.
- If MCP tools unload, re-load them via ToolSearch.
