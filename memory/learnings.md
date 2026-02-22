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

## Patterns
- MCP tools are deferred — must ToolSearch before first use each session
- Within same session, tools stay loaded — skip redundant ToolSearch
- Git push needs SSH key: GIT_SSH_COMMAND="ssh -i /path/to/key -o IdentitiesOnly=yes" git push
