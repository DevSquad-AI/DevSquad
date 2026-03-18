import type { AgentConfig } from "@opencode-ai/sdk"
import type { BuiltinAgentName, AgentOverrides, AgentFactory, AgentPromptMetadata } from "./types"
import type { CategoriesConfig, GitMasterConfig } from "../config/schema"
import type { LoadedSkill } from "../features/opencode-skill-loader/types"
import type { BrowserAutomationProvider } from "../config/schema"
import { createLeaderAgent, LEADER_PROMPT_METADATA } from "./leader"
import { createArchitectAgent, ARCHITECT_PROMPT_METADATA } from "./architect"
import { createResearcherAgent, RESEARCHER_PROMPT_METADATA } from "./researcher"
import { createScoutAgent, SCOUT_PROMPT_METADATA } from "./scout"
import { createMultimodalAgent, MULTIMODAL_PROMPT_METADATA } from "./multimodal"
import { createAdvisorAgent, advisorPromptMetadata } from "./advisor"
import { createAtlasAgent, atlasPromptMetadata } from "./atlas"
import { createReviewerAgent, reviewerPromptMetadata } from "./reviewer"
import { createWorkerAgent } from "./worker"
import type { AvailableCategory } from "./dynamic-agent-prompt-builder"
import {
  fetchAvailableModels,
  readConnectedProvidersCache,
  readProviderModelsCache,
} from "../shared"
import { CATEGORY_DESCRIPTIONS } from "../tools/delegate-task/constants"
import { mergeCategories } from "../shared/merge-categories"
import { buildAvailableSkills } from "./builtin-agents/available-skills"
import { collectPendingBuiltinAgents } from "./builtin-agents/general-agents"
import { maybeCreateLeaderConfig } from "./builtin-agents/leader-agent"
import { maybeCreateWorkerConfig } from "./builtin-agents/worker-agent"
import { maybeCreateAtlasConfig } from "./builtin-agents/atlas-agent"
import { buildCustomAgentMetadata, parseRegisteredAgentSummaries } from "./custom-agent-summaries"

type AgentSource = AgentFactory | AgentConfig

const agentSources: Record<BuiltinAgentName, AgentSource> = {
  // New agent names
  leader: createLeaderAgent,
  worker: createWorkerAgent,
  architect: createArchitectAgent,
  researcher: createResearcherAgent,
  scout: createScoutAgent,
  "multimodal-looker": createMultimodalAgent,
  advisor: createAdvisorAgent,
  planner: createAtlasAgent as AgentFactory,
  reviewer: createReviewerAgent,
  // Legacy agent names (for backward compatibility)
  sisyphus: createLeaderAgent,
  hephaestus: createWorkerAgent,
  oracle: createArchitectAgent,
  librarian: createResearcherAgent,
  explore: createScoutAgent,
  metis: createAdvisorAgent,
  momus: createReviewerAgent,
  // Note: Atlas is handled specially in createBuiltinAgents()
  // because it needs OrchestratorContext, not just a model string
  atlas: createAtlasAgent as AgentFactory,
}

/**
 * Metadata for each agent, used to build Leader's dynamic prompt sections
 * (Delegation Table, Tool Selection, Key Triggers, etc.)
 */
const agentMetadata: Partial<Record<BuiltinAgentName, AgentPromptMetadata>> = {
  // New agent names
  architect: ARCHITECT_PROMPT_METADATA,
  researcher: RESEARCHER_PROMPT_METADATA,
  scout: SCOUT_PROMPT_METADATA,
  "multimodal-looker": MULTIMODAL_PROMPT_METADATA,
  advisor: advisorPromptMetadata,
  reviewer: reviewerPromptMetadata,
  planner: atlasPromptMetadata,
  // Legacy agent names
  oracle: ARCHITECT_PROMPT_METADATA,
  librarian: RESEARCHER_PROMPT_METADATA,
  explore: SCOUT_PROMPT_METADATA,
  metis: advisorPromptMetadata,
  momus: reviewerPromptMetadata,
  atlas: atlasPromptMetadata,
}

export async function createBuiltinAgents(
  disabledAgents: string[] = [],
  agentOverrides: AgentOverrides = {},
  directory?: string,
  systemDefaultModel?: string,
  categories?: CategoriesConfig,
  gitMasterConfig?: GitMasterConfig,
  discoveredSkills: LoadedSkill[] = [],
  customAgentSummaries?: unknown,
  browserProvider?: BrowserAutomationProvider,
  uiSelectedModel?: string,
  disabledSkills?: Set<string>,
  useTaskSystem = false,
  disableOmoEnv = false
): Promise<Record<string, AgentConfig>> {
  const connectedProviders = readConnectedProvidersCache()
  const providerModelsConnected = connectedProviders
    ? (readProviderModelsCache()?.connected ?? [])
    : []
  const mergedConnectedProviders = Array.from(
    new Set([...(connectedProviders ?? []), ...providerModelsConnected])
  )
  const availableModels = await fetchAvailableModels(undefined, {
    connectedProviders: mergedConnectedProviders.length > 0 ? mergedConnectedProviders : undefined,
  })
  const isFirstRunNoCache =
    availableModels.size === 0 && mergedConnectedProviders.length === 0

  const result: Record<string, AgentConfig> = {}

  const mergedCategories = mergeCategories(categories)

  const availableCategories: AvailableCategory[] = Object.entries(mergedCategories).map(([name]) => ({
    name,
    description: categories?.[name]?.description ?? CATEGORY_DESCRIPTIONS[name] ?? "General tasks",
  }))

  const availableSkills = buildAvailableSkills(discoveredSkills, browserProvider, disabledSkills)

  // Collect general agents first (for availableAgents), but don't add to result yet
  const { pendingAgentConfigs, availableAgents } = collectPendingBuiltinAgents({
    agentSources,
    agentMetadata,
    disabledAgents,
    agentOverrides,
    directory,
    systemDefaultModel,
    mergedCategories,
    gitMasterConfig,
    browserProvider,
    uiSelectedModel,
    availableModels,
    disabledSkills,
    disableOmoEnv,
  })

  const registeredAgents = parseRegisteredAgentSummaries(customAgentSummaries)
  const builtinAgentNames = new Set(Object.keys(agentSources).map((name) => name.toLowerCase()))
  const disabledAgentNames = new Set(disabledAgents.map((name) => name.toLowerCase()))

  for (const agent of registeredAgents) {
    const lowerName = agent.name.toLowerCase()
    if (builtinAgentNames.has(lowerName)) continue
    if (disabledAgentNames.has(lowerName)) continue
    if (availableAgents.some((availableAgent) => availableAgent.name.toLowerCase() === lowerName)) continue

    availableAgents.push({
      name: agent.name,
      description: agent.description,
      metadata: buildCustomAgentMetadata(agent.name, agent.description),
    })
  }

  const leaderConfig = maybeCreateLeaderConfig({
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
    userCategories: categories,
    useTaskSystem,
    disableOmoEnv,
  })
  if (leaderConfig) {
    result["leader"] = leaderConfig
    result["sisyphus"] = leaderConfig // Backward compatibility
  }

  const workerConfig = maybeCreateWorkerConfig({
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
    disableOmoEnv,
  })
  if (workerConfig) {
    result["worker"] = workerConfig
    result["hephaestus"] = workerConfig // Backward compatibility
  }

  // Add pending agents after leader and worker to maintain order
  for (const [name, config] of pendingAgentConfigs) {
    result[name] = config
  }

  const atlasConfig = maybeCreateAtlasConfig({
    disabledAgents,
    agentOverrides,
    uiSelectedModel,
    availableModels,
    systemDefaultModel,
    availableAgents,
    availableSkills,
    mergedCategories,
    directory,
    userCategories: categories,
  })
  if (atlasConfig) {
    result["planner"] = atlasConfig
    result["atlas"] = atlasConfig // Backward compatibility
  }

  return result
}