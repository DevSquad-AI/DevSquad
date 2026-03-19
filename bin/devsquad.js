#!/usr/bin/env node
// bin/devsquad.js
// Wrapper script that detects platform and spawns the correct binary OR runs from source

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Check if dist exists (published package)
const distIndex = join(rootDir, "dist", "index.js");
const cliIndex = join(rootDir, "dist", "cli", "index.js");

if (existsSync(cliIndex)) {
  // Use pre-built dist (published package)
  const { spawn } = await import("node:child_process");
  const child = spawn("bun", [cliIndex, ...process.argv.slice(2)], {
    stdio: "inherit",
    env: process.env,
  });
  process.exitCode = child.exitCode;
} else if (existsSync(join(rootDir, "src", "cli", "index.ts"))) {
  // Run directly from source (dev mode or bunx from GitHub)
  const { spawn } = await import("node:child_process");
  const child = spawn("bun", [join(rootDir, "src", "cli", "index.ts"), ...process.argv.slice(2)], {
    stdio: "inherit",
    env: { ...process.env, BUN_INSTALL_ALLOW_SCRIPTS: "true" },
  });
  process.exitCode = child.exitCode;
} else {
  console.error("Error: Could not find CLI entry point");
  console.error("Please run 'bun run build' first, or install from npm: npm install devsquad");
  process.exit(1);
}