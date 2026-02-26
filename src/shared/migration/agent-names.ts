export const AGENT_NAME_MAP: Record<string, string> = {
  // Sisyphus variants → "sisyphus" (Leader)
  omo: "sisyphus",
  OmO: "sisyphus",
  Sisyphus: "sisyphus",
  sisyphus: "sisyphus",
  Leader: "sisyphus",
  leader: "sisyphus",

  // Hephaestus → "hephaestus" (Worker)
  Hephaestus: "hephaestus",
  hephaestus: "hephaestus",
  Worker: "hephaestus",
  worker: "hephaestus",

  // Prometheus variants → "prometheus" (Planner)
  "OmO-Plan": "prometheus",
  "omo-plan": "prometheus",
  "Planner-Sisyphus": "prometheus",
  "planner-sisyphus": "prometheus",
  "Prometheus (Planner)": "prometheus",
  prometheus: "prometheus",
  Planner: "prometheus",
  planner: "prometheus",

  // Atlas variants → "atlas"
  "orchestrator-sisyphus": "atlas",
  Atlas: "atlas",
  atlas: "atlas",

  // Metis variants → "metis" (Advisor)
  "plan-consultant": "metis",
  "Metis (Plan Consultant)": "metis",
  metis: "metis",
  Advisor: "metis",
  advisor: "metis",

  // Momus variants → "momus" (Reviewer)
  "Momus (Plan Reviewer)": "momus",
  momus: "momus",
  Reviewer: "momus",
  reviewer: "momus",

  // Oracle → "oracle" (Architect)
  Oracle: "oracle",
  oracle: "oracle",
  Architect: "oracle",
  architect: "oracle",

  // Librarian → "librarian" (Researcher)
  Librarian: "librarian",
  librarian: "librarian",
  Researcher: "librarian",
  researcher: "librarian",

  // Explore → "explore" (Scout)
  Explore: "explore",
  explore: "explore",
  Scout: "explore",
  scout: "explore",

  // Multimodal-Looker → "multimodal-looker"
  "Multimodal-Looker": "multimodal-looker",
  "multimodal-looker": "multimodal-looker",
  Multimodal: "multimodal-looker",
  multimodal: "multimodal-looker",

  // Sisyphus-Junior → "sisyphus-junior"
  "Sisyphus-Junior": "sisyphus-junior",
  "sisyphus-junior": "sisyphus-junior",
  Junior: "sisyphus-junior",
  junior: "sisyphus-junior",

  // Already lowercase - passthrough
  build: "build",
  plan: "plan",
}

export const BUILTIN_AGENT_NAMES = new Set([
  "sisyphus", // Leader
  "hephaestus", // Worker
  "oracle", // Architect
  "librarian", // Researcher
  "explore", // Scout
  "multimodal-looker", // Multimodal
  "metis", // Advisor
  "momus", // Reviewer
  "prometheus", // Planner
  "atlas", // Atlas
  "sisyphus-junior", // Junior
  "build",
  "plan",
])

export function migrateAgentNames(
  agents: Record<string, unknown>
): { migrated: Record<string, unknown>; changed: boolean } {
  const migrated: Record<string, unknown> = {}
  let changed = false

  for (const [key, value] of Object.entries(agents)) {
    const newKey = AGENT_NAME_MAP[key.toLowerCase()] ?? AGENT_NAME_MAP[key] ?? key
    if (newKey !== key) {
      changed = true
    }
    migrated[newKey] = value
  }

  return { migrated, changed }
}
