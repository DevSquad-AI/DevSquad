import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentOverrides } from "../types"
import type { CategoryConfig } from "../../config/schema"
import type { AvailableAgent, AvailableCategory, AvailableSkill } from "../dynamic-agent-prompt-builder"
import { AGENT_MODEL_REQUIREMENTS, isAnyProviderConnected } from "../../shared"
import { createWorkerAgent } from "../worker"
import { applyEnvironmentContext } from "./environment-context"
import { applyCategoryOverride, mergeAgentConfig } from "./agent-overrides"
import { applyModelResolution, getFirstFallbackModel } from "./model-resolution"

export function maybeCreateWorkerConfig(input: {
  disabledAgents: string[]
  agentOverrides: AgentOverrides
  availableModels: Set<string>
  systemDefaultModel?: string
  isFirstRunNoCache: boolean
  availableAgents: AvailableAgent[]
  availableSkills: AvailableSkill[]
  availableCategories: AvailableCategory[]
  mergedCategories: Record<string, CategoryConfig>
  directory?: string
  useTaskSystem: boolean
  disableOmoEnv?: boolean
}): AgentConfig | undefined {
  const {
    disabledAgents,
    agentOverrides,
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

  if (disabledAgents.includes("hephaestus")) return undefined

  const workerOverride = agentOverrides["hephaestus"]
  const workerRequirement = AGENT_MODEL_REQUIREMENTS["hephaestus"]
  const hasWorkerExplicitConfig = workerOverride !== undefined

  const hasRequiredProvider =
    !workerRequirement?.requiresProvider ||
    hasWorkerExplicitConfig ||
    isFirstRunNoCache ||
    isAnyProviderConnected(workerRequirement.requiresProvider, availableModels)

  if (!hasRequiredProvider) return undefined

  let workerResolution = applyModelResolution({
    userModel: workerOverride?.model,
    requirement: workerRequirement,
    availableModels,
    systemDefaultModel,
  })

  if (isFirstRunNoCache && !workerOverride?.model) {
    workerResolution = getFirstFallbackModel(workerRequirement)
  }

  if (!workerResolution) return undefined
  const { model: workerModel, variant: workerResolvedVariant } = workerResolution

  let workerConfig = createWorkerAgent(
    workerModel,
    availableAgents,
    undefined,
    availableSkills,
    availableCategories,
    useTaskSystem
  )

  workerConfig = { ...workerConfig, variant: workerResolvedVariant ?? "medium" }

  const workerOverrideCategory = (workerOverride as Record<string, unknown> | undefined)?.category as string | undefined
  if (workerOverrideCategory) {
    workerConfig = applyCategoryOverride(workerConfig, workerOverrideCategory, mergedCategories)
  }

  workerConfig = applyEnvironmentContext(workerConfig, directory, { disableOmoEnv })

  if (workerOverride) {
    workerConfig = mergeAgentConfig(workerConfig, workerOverride, directory)
  }
  return workerConfig
}
