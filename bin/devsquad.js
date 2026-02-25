#!/usr/bin/env node
// bin/devsquad.js
// Wrapper script that detects platform and spawns the correct binary

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { getPlatformPackage, getBinaryPath } from "./platform.js";

const require = createRequire(import.meta.url);

/**
 * Detect libc family on Linux
 * @returns {string | null} 'glibc', 'musl', or null if detection fails
 */
function getLibcFamily() {
  if (process.platform !== "linux") {
    return undefined; // Not needed on non-Linux
  }
  
  try {
    const detectLibc = require("detect-libc");
    return detectLibc.familySync();
  } catch {
    // detect-libc not available
    return null;
  }
}

function main() {
  const { platform, arch } = process;

  let libcFamily = undefined;
  if (platform === "linux") {
    libcFamily = getLibcFamily();
  }

  const platformPackage = getPlatformPackage({ platform, arch, libcFamily });
  const binaryPath = getBinaryPath(platformPackage, platform);

  const child = spawnSync(binaryPath, process.argv.slice(2), {
    stdio: "inherit",
    env: {
      ...process.env,
      DEV_SQUAD: "true",
    },
  });

  process.exitCode = child.status;
}

main();
