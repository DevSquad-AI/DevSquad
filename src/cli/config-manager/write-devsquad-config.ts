import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { parseJsonc } from "../../shared"
import type { ConfigMergeResult, InstallConfig } from "../types"
import { getConfigDir, getDevsquadConfigPath } from "./config-context"
import { deepMergeRecord } from "./deep-merge-record"
import { ensureConfigDirectoryExists } from "./ensure-config-directory-exists"
import { formatErrorWithSuggestion } from "./format-error-with-suggestion"
import { generateDevsquadConfig } from "./generate-devsquad-config"

function isEmptyOrWhitespace(content: string): boolean {
  return content.trim().length === 0
}

export function writeDevsquadConfig(installConfig: InstallConfig): ConfigMergeResult {
  try {
    ensureConfigDirectoryExists()
  } catch (err) {
    return {
      success: false,
      configPath: getConfigDir(),
      error: formatErrorWithSuggestion(err, "create config directory"),
    }
  }

  const devsquadConfigPath = getDevsquadConfigPath()

  try {
    const newConfig = generateDevsquadConfig(installConfig)

    if (existsSync(devsquadConfigPath)) {
      try {
        const stat = statSync(devsquadConfigPath)
        const content = readFileSync(devsquadConfigPath, "utf-8")

        if (stat.size === 0 || isEmptyOrWhitespace(content)) {
          writeFileSync(devsquadConfigPath, JSON.stringify(newConfig, null, 2) + "\n")
          return { success: true, configPath: devsquadConfigPath }
        }

        const existing = parseJsonc<Record<string, unknown>>(content)
        if (!existing || typeof existing !== "object" || Array.isArray(existing)) {
          writeFileSync(devsquadConfigPath, JSON.stringify(newConfig, null, 2) + "\n")
          return { success: true, configPath: devsquadConfigPath }
        }

        const merged = deepMergeRecord(existing, newConfig)
        writeFileSync(devsquadConfigPath, JSON.stringify(merged, null, 2) + "\n")
      } catch (parseErr) {
        if (parseErr instanceof SyntaxError) {
          writeFileSync(devsquadConfigPath, JSON.stringify(newConfig, null, 2) + "\n")
          return { success: true, configPath: devsquadConfigPath }
        }
        throw parseErr
      }
    } else {
      writeFileSync(devsquadConfigPath, JSON.stringify(newConfig, null, 2) + "\n")
    }

    return { success: true, configPath: devsquadConfigPath }
  } catch (err) {
    return {
      success: false,
      configPath: devsquadConfigPath,
      error: formatErrorWithSuggestion(err, "write devsquad config"),
    }
  }
}