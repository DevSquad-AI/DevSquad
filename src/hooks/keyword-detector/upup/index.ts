/**
 * Upup message module - routes to appropriate message based on agent/model.
 *
 * Routing:
 * 1. Planner agents (prometheus, plan) → planner.ts
 * 2. GPT 5.2 models → gpt5.2.ts
 * 3. Gemini models → gemini.ts
 * 4. Default (Claude, etc.) → default.ts (optimized for Claude series)
 */

export { isPlannerAgent, isGptModel, isGeminiModel, getUpupSource } from "./source-detector"
export type { UpupSource } from "./source-detector"
export { UPUP_PLANNER_SECTION, getPlannerUpupMessage } from "./planner"
export { UPUP_GPT_MESSAGE, getGptUpupMessage } from "./gpt5.2"
export { UPUP_GEMINI_MESSAGE, getGeminiUpupMessage } from "./gemini"
export { UPUP_DEFAULT_MESSAGE, getDefaultUpupMessage } from "./default"

import { getUpupSource } from "./source-detector"
import { getPlannerUpupMessage } from "./planner"
import { getGptUpupMessage } from "./gpt5.2"
import { getDefaultUpupMessage } from "./default"
import { getGeminiUpupMessage } from "./gemini"

/**
 * Gets the appropriate upup message based on agent and model context.
 */
export function getUpupMessage(agentName?: string, modelID?: string): string {
  const source = getUpupSource(agentName, modelID)

  switch (source) {
    case "planner":
      return getPlannerUpupMessage()
    case "gpt":
      return getGptUpupMessage()
    case "gemini":
      return getGeminiUpupMessage()
    case "default":
    default:
      return getDefaultUpupMessage()
  }
}
