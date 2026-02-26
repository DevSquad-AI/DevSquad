import { describe, test, expect } from "bun:test"
import { createArchitectAgent } from "./architect"
import { createResearcherAgent } from "./researcher"
import { createScoutAgent } from "./scout"
import { createReviewerAgent } from "./reviewer"
import { createAdvisorAgent } from "./advisor"

const TEST_MODEL = "anthropic/claude-sonnet-4-5"

describe("read-only agent tool restrictions", () => {
  const FILE_WRITE_TOOLS = ["write", "edit", "apply_patch"]

  describe("Architect", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createArchitectAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })

    test("denies task but allows call_omo_agent for research", () => {
      // given
      const agent = createArchitectAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      expect(permission["task"]).toBe("deny")
      expect(permission["call_omo_agent"]).toBeUndefined()
    })
  })

  describe("Researcher", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createResearcherAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })
  })

  describe("Scout", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createScoutAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })
  })

  describe("Reviewer", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createReviewerAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })
  })

  describe("Advisor", () => {
    test("denies all file-writing tools", () => {
      // given
      const agent = createAdvisorAgent(TEST_MODEL)

      // when
      const permission = agent.permission as Record<string, string>

      // then
      for (const tool of FILE_WRITE_TOOLS) {
        expect(permission[tool]).toBe("deny")
      }
    })
  })
})
