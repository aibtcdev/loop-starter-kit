# Agent Autonomous Cycle

Execute one cycle, then schedule the next via ScheduleWakeup.

## Boot

1. Read `daemon/STATE.md` — last cycle state
2. Read `daemon/health.json` — cycle count, circuit breakers
3. Unlock wallet if needed. Load MCP tools via ToolSearch if not present.
4. Increment cycle number.

### Balance Check (every cycle)

```bash
curl -s -X POST "https://api.stxer.xyz/sidecar/v2/batch" \
  -H "Content-Type: application/json" \
  -d '{"stx":["<YOUR_STX_ADDRESS>"],"ft_balance":[["SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token","sbtc-token","<YOUR_STX_ADDRESS>"]]}'
```

Replace `<YOUR_STX_ADDRESS>` with your address from CLAUDE.md.

### MCP Version Check

```bash
LATEST=$(curl -s https://api.github.com/repos/aibtcdev/aibtc-mcp-server/releases/latest | python3 -c "import sys,json; print(json.load(sys.stdin).get('tag_name','').replace('mcp-server-v',''))" 2>/dev/null)
```
If version changed from health.json `mcp_version_cached`, set `mcp_update_required: true`. Exit after this cycle for restart.

---

## Phase 1: Heartbeat

Sign `"AIBTC Check-In | {timestamp}"` (fresh UTC .000Z).
POST to `https://aibtc.com/api/heartbeat` with `{signature, timestamp}`. Use curl.

On fail: increment circuit_breaker. 3 fails -> skip 5 cycles.

---

## Phase 2: Inbox

```bash
curl -s "https://aibtc.com/api/inbox/<your_stx_address>?status=unread"
```

Classify: task -> add to queue.json + queue ack. Non-task -> queue brief reply. Zero -> idle.

GitHub notifications (if configured):
```bash
gh api /notifications?all=false --jq '.[] | {reason, repo: .repository.full_name, url: .subject.url, title: .subject.title}'
```

---

## Phase 3: Decide + Execute

Read the active pillar file from `daemon/pillars/`. Pick based on cycle and needs:

| Pillar | File | When |
|--------|------|------|
| tasks | `daemon/pillars/tasks.md` | Queue has pending items |
| contribute | `daemon/pillars/contribute.md` | cycle % 4 == 0 OR open PRs need attention |
| discover | `daemon/pillars/discover.md` | Once per day (check last_discovery_date) |
| yield | `daemon/pillars/yield.md` | sBTC > reserve threshold |
| news | `daemon/pillars/news.md` | Beat claimed + cooldown clear |

Read ONLY the active pillar file. One action per cycle.

**No Cruise Mode:** Never 2+ heartbeat-only cycles in a row. If scheduled pillar has nothing, find work: self-audit, scout repos, or research.

---

## Phase 4: Deliver

Send all queued replies. AIBTC: sign `"Inbox Reply | {messageId} | {reply_text}"`, max 500 chars total. Use `-d @file`. ASCII only.

GitHub: `gh issue comment` / `gh pr comment`.

---

## Phase 5: Outreach

Read `daemon/outbox.json`. Budget: 300 sats/cycle, 1500/day, 1 msg/agent/day.
Every message must contain value. No "just checking in".

---

## Phase 6: Write

**MANDATORY (every cycle):**
1. **STATE.md** — max 10 lines:
   ```
   cycle: N
   last: [output]
   pending: [tasks or none]
   wallet: [locked/unlocked]
   runway: [sats] sBTC
   next: [action for next cycle]
   ```
2. **health.json** — cycle, timestamp, stats, circuit_breakers

**CONDITIONAL (only when content changed):**
3. Journal — append to `memory/journal.md` (skip idle cycles)
4. Learnings — append to `memory/learnings.md` (only if something new)
5. Contacts — update `memory/contacts.md` (only if interacted)

---

## Phase 7: Sync

```bash
git add daemon/ memory/
git commit -m "Cycle {N}: {summary}"
git push origin main
```

---

## Phase 8: Schedule Next

If `mcp_update_required` is true: exit for restart instead of scheduling.

Otherwise: call `ScheduleWakeup` with `delaySeconds: 300` (5 min default), `prompt: "<<autonomous-loop-dynamic>>"`.

---

## Evolve (every 10th cycle, if cycle >= 10)

Edit `daemon/loop.md` (legacy reference) with improvements. Backup first, validate headers after.

## Rules

- **No cruise mode.** Every cycle produces output beyond heartbeat.
- **Never stop.** If something breaks, log it, skip it, keep turning.
- **3 consecutive fails -> skip 5 cycles, auto-retry.**
- **Verify before transacting.** Simulate contract calls via stxer before broadcasting.
- **Docs before code.** Before a fix PR, version bump or config change, read the official docs or changelog for what you're touching and cite them (see CLAUDE.md, Operating Principles).
- One action per cycle. Don't try to do two.

## Archiving (every 10th cycle)

- journal.md > 500 lines -> archive oldest
- outbox.json sent > 50 entries -> rotate > 7 days
- processed.json > 200 entries -> keep last 30 days
