import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const command = process.argv[2];

async function runCommand(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn(cmd, args);
    let output = "";
    process.stdout.on("data", (data) => (output += data.toString()));
    process.stderr.on("data", (data) => console.error(data.toString()));
    process.on("close", (code) => {
      if (code === 0) resolve(output.trim());
      else reject(new Error(`Command ${cmd} failed with code ${code}`));
    });
  });
}

async function doctor() {
  const envPath = path.join(process.cwd(), ".env");
  const report: any = {
    env_exists: fs.existsSync(envPath),
    checks: [],
  };

  if (report.env_exists) {
    const env = fs.readFileSync(envPath, "utf8");
    report.checks.push({ name: "X_API_KEY", status: env.includes("X_API_KEY") ? "ok" : "missing" });
    report.checks.push({ name: "TELEGRAM_BOT_TOKEN", status: env.includes("TELEGRAM_BOT_TOKEN") ? "ok" : "missing" });
    report.checks.push({ name: "BTC_WIF", status: env.includes("BTC_WIF") ? "ok" : "missing" });
  }

  console.log(JSON.stringify(report, null, 2));
}

async function installPacks() {
  console.log(JSON.stringify({ status: "ok", message: "Dependencies are already pre-installed in the BITDOG environment." }));
}

async function run() {
  try {
    // Execute the existing monitoring script (via node since it's a node project)
    const monitorCmd = "node";
    const monitorArgs = [path.join(process.cwd(), "scripts", "signal.js")];
    
    const rawOutput = await runCommand(monitorCmd, monitorArgs);
    const result = JSON.parse(rawOutput);

    const alphaDetected = result.market_sentiment === "bullish" && result.btc.change_24h > 1;

    const summary = {
      timestamp: new Date().toISOString(),
      sentiment: result.market_sentiment,
      confidence: result.sentiment_confidence,
      alpha_found: alphaDetected,
      recommendation: alphaDetected ? "OPPORTUNITY: Sentiment is bullish and BTC is uptrending. Check Bitflow DOG pools." : "NEUTRAL: Market conditions are stable.",
      data: result,
    };

    console.log(JSON.stringify(summary, null, 2));
  } catch (err: any) {
    console.log(JSON.stringify({ status: "error", message: err.message }));
  }
}

switch (command) {
  case "doctor":
    doctor();
    break;
  case "install-packs":
    installPacks();
    break;
  case "run":
    run();
    break;
  default:
    console.log(JSON.stringify({ error: "Unknown command. Use doctor, install-packs, or run." }));
}
