import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentOverrides } from "../types"
import type { CategoriesConfig, CategoryConfig } from "../../config/schema"
import type { AvailableAgent, AvailableCategory, AvailableSkill } from "../dynamic-agent-prompt-builder"
import { AGENT_MODEL_REQUIREMENTS, isAnyFallbackModelAvailable } from "../../shared"
import { applyEnvironmentContext } from "./environment-context"
import { applyOverrides } from "./agent-overrides"
import { applyModelResolution, getFirstFallbackModel } from "./model-resolution"
import { createLeaderAgent } from "../leader"

export function maybeCreateLeaderConfig(input: {
  disabledAgents: string[]
  agentOverrides: AgentOverrides
  uiSelectedModel?: string
  availableModels: Set<string>
  systemDefaultModel?: string
  isFirstRunNoCache: boolean
  availableAgents: AvailableAgent[]
  availableSkills: AvailableSkill[]
  availableCategories: AvailableCategory[]
  mergedCategories: Record<string, CategoryConfig>
  directory?: string
  userCategories?: CategoriesConfig
  useTaskSystem: boolean
  disableOmoEnv?: boolean
}): AgentConfig | undefined {
  const {
    disabledAgents,
    agentOverrides,
    uiSelectedModel,
    availableModels,
    systemDefaultModel,
    isFirstRunNoCache,
    availableAgents,
    availableSkills,
    availableCategories,
    mergedCategories,
    directory,
    useTaskSystem,
    disableOmoEnv = false,
  } = input

  const leaderOverride = agentOverrides["sisyphus"]
  const leaderRequirement = AGENT_MODEL_REQUIREMENTS["sisyphus"]
  const hasLeaderExplicitConfig = leaderOverride !== undefined
  const meetsLeaderAnyModelRequirement =
    !leaderRequirement?.requiresAnyModel ||
    hasLeaderExplicitConfig ||
    isFirstRunNoCache ||
    isAnyFallbackModelAvailable(leaderRequirement.fallbackChain, availableModels)

  if (disabledAgents.includes("sisyphus") || !meetsLeaderAnyModelRequirement) return undefined

  let leaderResolution = applyModelResolution({
    uiSelectedModel: leaderOverride?.model ? undefined : uiSelectedModel,
    userModel: leaderOverride?.model,
    requirement: leaderRequirement,
    availableModels,
    systemDefaultModel,
  })

  if (isFirstRunNoCache && !leaderOverride?.model && !uiSelectedModel) {
    leaderResolution = getFirstFallbackModel(leaderRequirement)
  }

  if (!leaderResolution) return undefined
  const { model: leaderModel, variant: leaderResolvedVariant } = leaderResolution

  let leaderConfig = createLeaderAgent(
    leaderModel,
    availableAgents,
    undefined,
    availableSkills,
    availableCategories,
    useTaskSystem
  )

  if (leaderResolvedVariant) {
    leaderConfig = { ...leaderConfig, variant: leaderResolvedVariant }
  }

  leaderConfig = applyOverrides(leaderConfig, leaderOverride, mergedCategories, directory)
  leaderConfig = applyEnvironmentContext(leaderConfig, directory, {
    disableOmoEnv,
  })

  return leaderConfig
}
