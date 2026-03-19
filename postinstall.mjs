// postinstall.mjs
// Runs after bun install to verify platform binary and register plugin

import { createRequire } from "node:module";
import { getPlatformPackage, getBinaryPath } from "./bin/platform.js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";

const require = createRequire(import.meta.url);

function getLibcFamily() {
  if (process.platform !== "linux") {
    return undefined;
  }
  try {
    const detectLibc = require("detect-libc");
    return detectLibc.familySync();
  } catch {
    return null;
  }
}

function getOpencodeConfigPath() {
  const home = homedir();
  const jsonPath = join(home, ".opencode", "opencode.json");
  const jsoncPath = join(home, ".opencode", "opencode.jsonc");
  if (existsSync(jsonPath)) return jsonPath;
  if (existsSync(jsoncPath)) return jsoncPath;
  return jsonPath;
}

function registerPlugin() {
  const configPath = getOpencodeConfigPath();
  const configDir = dirname(configPath);
  
  try {
    let config = { plugin: [] };
    if (existsSync(configPath)) {
      const content = readFileSync(configPath, "utf-8");
      config = JSON.parse(content);
    }
    
    if (!config.plugin) config.plugin = [];
    if (!config.plugin.includes("devsquad")) {
      config.plugin.push("devsquad");
      
      if (!existsSync(configDir)) {
        require("node:fs").mkdirSync(configDir, { recursive: true });
      }
      writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
      console.log("✓ devsquad registered in OpenCode");
    } else {
      console.log("✓ devsquad already registered in OpenCode");
    }
  } catch (error) {
    console.warn(`⚠ Failed to register plugin: ${error.message}`);
  }
}

function main() {
  const { platform, arch } = process;
  const libcFamily = getLibcFamily();
  
  try {
    const pkg = getPlatformPackage({ platform, arch, libcFamily });
    const binPath = getBinaryPath(pkg, platform);
    require.resolve(binPath);
    console.log(`✓ devsquad binary installed for ${platform}-${arch}`);
  } catch (error) {
    console.warn(`⚠ devsquad: ${error.message}`);
  }
  
  registerPlugin();
}

main();
