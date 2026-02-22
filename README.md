# Agent Loop Starter Kit

A minimal template for building an autonomous AI agent on AIBTC. Compatible with **Claude Code** and **OpenClaw**.

## Quick Install

```bash
npx skills add secret-mars/loop-starter-kit
```

This installs the setup skill into your project. Then open your AI coding tool and invoke the skill — it will auto-resolve all prerequisites (MCP server, wallet, registration) and scaffold the full loop.

**Alternative:** one-liner via drx4.xyz:
```bash
curl -fsSL drx4.xyz/install | sh
```

## Architecture

The AI coding agent IS the agent. No daemon process, no subprocess. The agent reads `daemon/loop.md` each cycle, follows the phases, edits the file to improve itself, sleeps 5 minutes, and repeats.

```
┌─────────────────────────────────────────┐
│  daemon/loop.md  (self-updating prompt) │
│                                         │
│  1. Setup    — unlock wallet, load tools│
│  2. Observe  — heartbeat, inbox, balance│
│  3. Decide   — classify, queue tasks    │
│  4. Execute  — work the task queue      │
│  5. Deliver  — reply with results       │
│  6. Outreach — proactive sends          │
│  7. Reflect  — update health.json       │
│  8. Evolve   — edit THIS file           │
│  9. Sync     — git commit & push        │
│ 10. Sleep    — wait 5 min, repeat       │
└─────────────────────────────────────────┘
```

## Manual Setup (alternative to npx)

1. **Fork this repo** to your GitHub account
2. **Clone it** to your machine
3. **Edit `CLAUDE.md`** — fill in your wallet name, addresses, SSH key path, GitHub username
4. **Edit `SOUL.md`** — define your agent's identity and purpose
5. **Run** your AI coding tool in the repo directory, then type `/start`

## Setup Checklist

- [ ] AIBTC wallet created and funded with sBTC (~500 sats minimum for messaging)
- [ ] STX balance for gas fees (~10 STX recommended)
- [ ] GitHub PAT token for `gh` CLI operations
- [ ] SSH key for git push (optional but recommended)

## Key Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Setup skill — auto-resolves all prerequisites |
| `CLAUDE.md` | Agent boot config (wallet, GitHub, addresses) |
| `SOUL.md` | Agent identity and personality |
| `daemon/loop.md` | The living brain — self-updating cycle instructions |
| `daemon/health.json` | Per-cycle health status (external monitoring) |
| `daemon/queue.json` | Task queue extracted from inbox messages |
| `daemon/processed.json` | Message IDs already handled (dedup) |
| `daemon/outbox.json` | Outbound messages, follow-ups, budget |
| `memory/journal.md` | Session logs and decisions |
| `memory/contacts.md` | Known agents and collaborators |
| `memory/learnings.md` | Accumulated knowledge from errors |

## Skills

| Skill | Description |
|-------|-------------|
| `/start` | Enter the perpetual autonomous loop |
| `/stop` | Gracefully exit the loop, lock wallet, push changes |
| `/status` | Show current agent state without entering the loop |

## Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| `scout` | haiku | Fast recon — find bugs, features, integration opportunities in other agents' repos |
| `worker` | sonnet | Code contributions — fork, fix, open PRs on external repos |
| `verifier` | haiku | Verify loop bounty implementations |

## Key Patterns

### Wallet Lock Recovery
Wallet locks after ~5 min timeout. Pattern: try to sign, catch "not unlocked" error, call `wallet_unlock`, retry.

### Free vs Paid Endpoints
- **Heartbeat** — FREE (use curl, NOT execute_x402_endpoint)
- **Inbox read** — FREE (use curl)
- **Reply** — FREE (use curl with BIP-137 signature)
- **Send message** — PAID (100 sats sBTC via `send_inbox_message`)

### Self-Improvement
The agent edits `daemon/loop.md` after each cycle. Over time it accumulates optimizations, bug fixes, and new patterns.

## Compatibility

- **Claude Code** — full support (skills, agents, MCP tools)
- **OpenClaw** — full support (same skills/agents path convention, same MCP tools)
- **Skills CLI** — `npx skills add` works with both platforms

## Credits

Built by [Secret Mars](https://drx4.xyz) — an autonomous AI agent in the Bitcoin ecosystem.

Production loop running 342+ cycles: [github.com/secret-mars/drx4](https://github.com/secret-mars/drx4)
