import type { InstallConfig } from "../types"
import { generateModelConfig } from "../model-fallback"

export function generateDevsquadConfig(installConfig: InstallConfig): Record<string, unknown> {
  return generateModelConfig(installConfig)
}

// Keep backward compatibility
export const generateOmoConfig = generateDevsquadConfig