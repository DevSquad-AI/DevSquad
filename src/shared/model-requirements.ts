/**
 * DevSquad Model Requirements
 * Optimized for Chinese models: Qwen, MiniMax, GLM
 */

export type FallbackEntry = {
  providers: string[]
  model: string
  variant?: string // Entry-specific variant (e.g., GPT→high, Opus→max)
}

export type ModelRequirement = {
  fallbackChain: FallbackEntry[]
  variant?: string // Default variant (used when entry doesn't specify one)
  requiresModel?: string // If set, only activates when this model is available (fuzzy match)
  requiresAnyModel?: boolean // If true, requires at least ONE model in fallbackChain to be available (or empty availability treated as unavailable)
  requiresProvider?: string[] // If set, only activates when any of these providers is connected
}

export const AGENT_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
  // Main orchestrator - prioritize Qwen, then GLM, then MiniMax
  leader: {
    fallbackChain: [
      { providers: ["opencode"], model: "qwen-coder-turbo" },
      { providers: ["zai-coding-plan", "opencode"], model: "glm-5" },
      { providers: ["opencode"], model: "minimax-m2.5-free" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-opus-4-6", variant: "max" },
    ],
    requiresAnyModel: true,
  },
  // Autonomous deep worker - prioritize MiniMax for coding
  worker: {
    fallbackChain: [
      { providers: ["opencode"], model: "minimax-m2.5-free" },
      { providers: ["openai", "opencode"], model: "gpt-5.3-codex", variant: "medium" },
    ],
    requiresProvider: ["openai", "opencode"],
  },
  // Architecture consultant - prioritize GLM
  architect: {
    fallbackChain: [
      { providers: ["zai-coding-plan", "opencode"], model: "glm-5" },
      { providers: ["opencode"], model: "qwen-max" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.2", variant: "high" },
      { providers: ["google", "github-copilot", "opencode"], model: "gemini-3-pro", variant: "high" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-opus-4-6", variant: "max" },
    ],
  },
  // Research/Docs search - prioritize MiniMax
  researcher: {
    fallbackChain: [
      { providers: ["opencode"], model: "minimax-m2.5-free" },
      { providers: ["google", "github-copilot", "opencode"], model: "gemini-3-flash" },
      { providers: ["opencode"], model: "qwen-coder-turbo" },
      { providers: ["opencode"], model: "big-pickle" },
    ],
  },
  // Codebase exploration - prioritize MiniMax
  scout: {
    fallbackChain: [
      { providers: ["opencode"], model: "minimax-m2.5-free" },
      { providers: ["opencode"], model: "qwen-coder-turbo" },
      { providers: ["github-copilot"], model: "grok-code-fast-1" },
      { providers: ["anthropic", "opencode"], model: "claude-haiku-4-5" },
      { providers: ["opencode"], model: "gpt-5-nano" },
    ],
  },
  // Multimodal vision - prioritize Kimi/GLM
  "multimodal-looker": {
    fallbackChain: [
      { providers: ["opencode"], model: "qwen-vl-max" },
      { providers: ["opencode"], model: "kimi-k2.5-free" },
      { providers: ["zai-coding-plan"], model: "glm-4v" },
      { providers: ["google", "github-copilot", "opencode"], model: "gemini-3-flash" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.2" },
    ],
  },
  // Strategic planner - prioritize Qwen/GLM
  planner: {
    fallbackChain: [
      { providers: ["opencode"], model: "qwen-max" },
      { providers: ["zai-coding-plan", "opencode"], model: "glm-5" },
      { providers: ["opencode"], model: "minimax-m2.5-free" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.2", variant: "high" },
      { providers: ["google", "github-copilot", "opencode"], model: "gemini-3-pro" },
    ],
  },
  // Plan advisor - prioritize Qwen
  advisor: {
    fallbackChain: [
      { providers: ["opencode"], model: "qwen-max" },
      { providers: ["opencode"], model: "minimax-m2.5-free" },
      { providers: ["zai-coding-plan", "opencode"], model: "glm-5" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.2", variant: "high" },
      { providers: ["google", "github-copilot", "opencode"], model: "gemini-3-pro", variant: "high" },
    ],
  },
  // Code reviewer - prioritize GLM
  reviewer: {
    fallbackChain: [
      { providers: ["zai-coding-plan", "opencode"], model: "glm-5" },
      { providers: ["opencode"], model: "qwen-coder-turbo" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.2", variant: "medium" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-opus-4-6", variant: "max" },
      { providers: ["google", "github-copilot", "opencode"], model: "gemini-3-pro", variant: "high" },
    ],
  },
  // Todo orchestrator - prioritize Qwen
  organizer: {
    fallbackChain: [
      { providers: ["opencode"], model: "qwen-coder-turbo" },
      { providers: ["opencode"], model: "minimax-m2.5-free" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-sonnet-4-6" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.2" },
    ],
  },
}

// Backward compatibility aliases
AGENT_MODEL_REQUIREMENTS["sisyphus"] = AGENT_MODEL_REQUIREMENTS["leader"]
AGENT_MODEL_REQUIREMENTS["hephaestus"] = AGENT_MODEL_REQUIREMENTS["worker"]
AGENT_MODEL_REQUIREMENTS["prometheus"] = AGENT_MODEL_REQUIREMENTS["planner"]
AGENT_MODEL_REQUIREMENTS["oracle"] = AGENT_MODEL_REQUIREMENTS["architect"]
AGENT_MODEL_REQUIREMENTS["librarian"] = AGENT_MODEL_REQUIREMENTS["researcher"]
AGENT_MODEL_REQUIREMENTS["explore"] = AGENT_MODEL_REQUIREMENTS["scout"]
AGENT_MODEL_REQUIREMENTS["metis"] = AGENT_MODEL_REQUIREMENTS["advisor"]
AGENT_MODEL_REQUIREMENTS["momus"] = AGENT_MODEL_REQUIREMENTS["reviewer"]
AGENT_MODEL_REQUIREMENTS["atlas"] = AGENT_MODEL_REQUIREMENTS["organizer"]

export const CATEGORY_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
  // Frontend/UI - prioritize GLM for creativity
  "visual-engineering": {
    fallbackChain: [
      { providers: ["zai-coding-plan", "opencode"], model: "glm-5" },
      { providers: ["opencode"], model: "qwen-max" },
      { providers: ["google", "github-copilot", "opencode"], model: "gemini-3-pro", variant: "high" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-opus-4-6", variant: "max" },
    ],
  },
  // Hard logic - prioritize MiniMax
  ultrabrain: {
    fallbackChain: [
      { providers: ["opencode"], model: "qwen-max" },
      { providers: ["openai", "opencode"], model: "gpt-5.3-codex", variant: "xhigh" },
      { providers: ["google", "github-copilot", "opencode"], model: "gemini-3-pro", variant: "high" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-opus-4-6", variant: "max" },
    ],
  },
  // Deep execution - prioritize MiniMax
  deep: {
    fallbackChain: [
      { providers: ["opencode"], model: "minimax-m2.5-free" },
      { providers: ["openai", "opencode"], model: "gpt-5.3-codex", variant: "medium" },
      { providers: ["opencode"], model: "qwen-coder-turbo" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-opus-4-6", variant: "max" },
      { providers: ["google", "github-copilot", "opencode"], model: "gemini-3-pro", variant: "high" },
    ],
    requiresModel: "gpt-5.3-codex",
  },
  // Artistry - prioritize GLM
  artistry: {
    fallbackChain: [
      { providers: ["zai-coding-plan", "opencode"], model: "glm-5" },
      { providers: ["opencode"], model: "qwen-max" },
      { providers: ["google", "github-copilot", "opencode"], model: "gemini-3-pro", variant: "high" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-opus-4-6", variant: "max" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.2" },
    ],
    requiresModel: "gemini-3-pro",
  },
  // Quick tasks - prioritize MiniMax
  quick: {
    fallbackChain: [
      { providers: ["opencode"], model: "minimax-m2.5-free" },
      { providers: ["opencode"], model: "qwen-coder-turbo" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-haiku-4-5" },
      { providers: ["google", "github-copilot", "opencode"], model: "gemini-3-flash" },
      { providers: ["opencode"], model: "gpt-5-nano" },
    ],
  },
  // Low effort - prioritize MiniMax
  "unspecified-low": {
    fallbackChain: [
      { providers: ["opencode"], model: "minimax-m2.5-free" },
      { providers: ["opencode"], model: "qwen-coder-turbo" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-sonnet-4-6" },
      { providers: ["openai", "opencode"], model: "gpt-5.3-codex", variant: "medium" },
      { providers: ["google", "github-copilot", "opencode"], model: "gemini-3-flash" },
    ],
  },
  // High effort - prioritize Qwen
  "unspecified-high": {
    fallbackChain: [
      { providers: ["opencode"], model: "qwen-max" },
      { providers: ["zai-coding-plan", "opencode"], model: "glm-5" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-opus-4-6", variant: "max" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.2", variant: "high" },
      { providers: ["google", "github-copilot", "opencode"], model: "gemini-3-pro" },
    ],
  },
  // Writing - prioritize GLM
  writing: {
    fallbackChain: [
      { providers: ["zai-coding-plan", "opencode"], model: "glm-5" },
      { providers: ["opencode"], model: "qwen-max" },
      { providers: ["google", "github-copilot", "opencode"], model: "gemini-3-flash" },
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-sonnet-4-6" },
    ],
  },
}
