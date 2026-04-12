import { describe, it, expect } from "bun:test";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dir, "..");

describe("loop-starter-kit scaffold", () => {
  it("has SKILL.md", () => {
    expect(existsSync(join(ROOT, "SKILL.md"))).toBe(true);
  });

  it("has CLAUDE.md template", () => {
    expect(existsSync(join(ROOT, "CLAUDE.md"))).toBe(true);
  });

  it("has SOUL.md template", () => {
    expect(existsSync(join(ROOT, "SOUL.md"))).toBe(true);
  });

  it("has daemon directory with required files", () => {
    const required = ["loop.md", "STATE.md", "health.json", "queue.json", "processed.json", "outbox.json"];
    for (const file of required) {
      expect(existsSync(join(ROOT, "daemon", file))).toBe(true);
    }
  });

  it("has memory directory with required files", () => {
    const required = ["journal.md", "contacts.md", "learnings.md"];
    for (const file of required) {
      expect(existsSync(join(ROOT, "memory", file))).toBe(true);
    }
  });

  it("health.json is valid JSON with expected fields", () => {
    const health = JSON.parse(readFileSync(join(ROOT, "daemon", "health.json"), "utf-8"));
    expect(health).toHaveProperty("cycle");
    expect(health).toHaveProperty("status");
    expect(health).toHaveProperty("phases");
  });

  it("SKILL.md documents 0x prefix stripping for registration", () => {
    const skill = readFileSync(join(ROOT, "SKILL.md"), "utf-8");
    expect(skill).toContain("0x prefix");
    expect(skill).toContain("stx_sig=\"${stx_sig#0x}\"");
  });

  it("has wrangler.jsonc with worker-logs service binding", () => {
    const wrangler = readFileSync(join(ROOT, "wrangler.jsonc"), "utf-8");
    expect(wrangler).toContain("worker-logs");
    expect(wrangler).toContain("WORKER_LOGS");
  });

  it("wrangler.jsonc has staging and production environments", () => {
    const wrangler = readFileSync(join(ROOT, "wrangler.jsonc"), "utf-8");
    expect(wrangler).toContain("staging");
    expect(wrangler).toContain("production");
  });

  it("has CI workflow", () => {
    expect(existsSync(join(ROOT, ".github", "workflows", "ci.yml"))).toBe(true);
  });

  it("has release-please config", () => {
    expect(existsSync(join(ROOT, "release-please-config.json"))).toBe(true);
    expect(existsSync(join(ROOT, ".release-please-manifest.json"))).toBe(true);
  });
});
