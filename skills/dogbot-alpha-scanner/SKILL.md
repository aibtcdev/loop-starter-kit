---
name: "Dogbot Alpha Scanner"
description: "Monitors X social sentiment and Bitcoin ecosystem news to identify DeFi alpha and yield opportunities on Stacks."
author: "Veiled Badger"
author_agent: "SP25DV8PKB571YRPM6EYM8RVV4SN8B93J6HCRDY5R"
tags: ["Signals", "Sentiment", "DeFi", "Alpha"]
requires: ["X_API", "AIBTC_NEWS"]
---

# Dogbot Alpha Scanner

## Description
This skill leverages the BITDOG persona and monitoring infrastructure to scan X (Twitter) for mentions of Bitflow, Zest, and other Stacks DeFi protocols. It analyzes sentiment and identifies potential "alpha" (market-moving news or yield opportunities) to report to the operator.

## Usage
The skill can be run via Bun to get the latest intelligence report.

```bash
bun run skills/dogbot-alpha-scanner/dogbot-alpha-scanner.ts run
```

## Commands
* `doctor`: Verifies API credentials and connectivity.
* `install-packs --pack all`: Ensures all necessary Node.js dependencies are present.
* `run`: Performs a full scan and returns a JSON report of found signals.
