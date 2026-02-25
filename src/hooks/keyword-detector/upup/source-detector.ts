/**
 * Agent/model detection utilities for upup message routing.
 *
 * Routing logic:
 * 1. Planner agents (prometheus, plan) → planner.ts
 * 2. GPT 5.2 models → gpt5.2.ts
 * 3. Gemini models → gemini.ts
 * 4. Everything else (Claude, etc.) → default.ts
 */

import { isGptModel, isGeminiModel } from "../../../agents/types"

/**
 * Checks if agent is a planner-type agent.
 * Planners don't need upup injection (they ARE the planner).
 */
export function isPlannerAgent(agentName?: string): boolean {
  if (!agentName) return false
  const lowerName = agentName.toLowerCase()
  if (lowerName.includes("prometheus") || lowerName.includes("planner")) return true

  const normalized = lowerName.replace(/[_-]+/g, " ")
  return /\bplan\b/.test(normalized)
}

export { isGptModel, isGeminiModel }

/** Upup message source type */
export type UpupSource = "planner" | "gpt" | "gemini" | "default"

/**
 * Determines which upup message source to use.
 */
export function getUpupSource(
  agentName?: string,
  modelID?: string
): UpupSource {
  // Priority 1: Planner agents
  if (isPlannerAgent(agentName)) {
    return "planner"
  }

  // Priority 2: GPT models
  if (modelID && isGptModel(modelID)) {
    return "gpt"
  }


  // Priority 3: Gemini models
  if (modelID && isGeminiModel(modelID)) {
    return "gemini"
  }
  // Default: Claude and other models
  return "default"
}
