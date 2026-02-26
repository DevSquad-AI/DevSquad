export { buildDefaultJuniorPrompt } from "./default"
export { buildGptJuniorPrompt } from "./gpt"
export { buildGeminiJuniorPrompt } from "./gemini"

export {
  JUNIOR_DEFAULTS,
  getJuniorPromptSource,
  buildJuniorPrompt,
  createJuniorAgentWithOverrides,
} from "./agent"
export type { JuniorPromptSource } from "./agent"
