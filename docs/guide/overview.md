# What Is DevSquad?

DevSquad is a multi-model agent orchestration harness for OpenCode. It transforms a single AI agent into a coordinated development team that actually ships code.

Not locked to Claude. Not locked to OpenAI. Not locked to anyone.

Just better results, cheaper models, real orchestration.

---

## Quick Start

### Installation

Paste this into your LLM agent session:

```
Install and configure devsquad by following the instructions here:
https://github.com/devsquad-ai/devsquad/blob/master/docs/guide/installation.md
```

Or read the full [Installation Guide](./installation.md) for manual setup, provider authentication, and troubleshooting.

### Your First Task

Once installed, just type:

```
upup
```

That's it. The agent figures everything out — explores your codebase, researches patterns, implements the feature, verifies with diagnostics. Keeps working until done.

Want more control? Press **Tab** to enter [Advisor mode](./orchestration.md) for interview-based planning, then run `/start-work` for full orchestration.

---

## The Philosophy: Breaking Free

We used to call this "OpenCode/Claude Code on steroids." That was wrong.

This isn't about making OpenCode/Claude Code better. It's about breaking free from the idea that one model, one provider, one way of working is enough. Anthropic wants you locked in. OpenAI wants you locked in. Everyone wants you locked in.

DevSquad doesn't play that game. It orchestrates across models, picking the right brain for the right job. Claude for orchestration. GPT for deep reasoning. Gemini for frontend. Qwen, MiniMax, GLM for Chinese models. All working together, automatically.

---

## How It Works: Agent Orchestration

Instead of one agent doing everything, DevSquad uses **specialized agents that delegate to each other** based on task type.

**The Architecture:**

```
User Request
    ↓
[Intent Gate] — Classifies what you actually want
    ↓
[Leader] — Main orchestrator, plans and delegates
    ↓
    ├─→ [Advisor] — Strategic planning (interview mode)
    ├─→ [Planner] — Todo orchestration and execution
    ├─→ [Architect] — Architecture consultation
    ├─→ [Researcher] — Documentation/code search
    ├─→ [Scout] — Fast codebase grep
    └─→ [Category-based agents] — Specialized by task type
```

When Leader delegates to a subagent, it doesn't pick a model name. It picks a **category** — `visual-engineering`, `ultrabrain`, `quick`, `deep`. The category automatically maps to the right model. You touch nothing.

For a deep dive into how agents collaborate, see the [Orchestration System Guide](./orchestration.md).

---

## Meet the Agents

### Leader: The Discipline Agent

Named after the Greek myth. He rolls the boulder every day. Never stops. Never gives up.

Leader is your main orchestrator. He plans, delegates to specialists, and drives tasks to completion with aggressive parallel execution. He doesn't stop halfway. He doesn't get distracted. He finishes.

**Recommended models:**
- **Qwen Coder Turbo** — Best overall experience for Chinese models.
- **Claude Sonnet 4.6** — Good balance of capability and cost.
- **MiniMax M2.5** — Great alternative, optimized for Chinese.
- **GLM 5** — Solid option via Z.ai.

Leader has optimized prompts for Chinese models. Qwen-family models work best because that's what the prompts were engineered for.

### Worker: The Legitimate Craftsman

Named with intentional irony. Anthropic blocked OpenCode from using their API because of this project. So the team built an autonomous GPT-native agent instead.

Worker runs on deep coding models. Give him a goal, not a recipe. He explores the codebase, researches patterns, and executes end-to-end without hand-holding. He is the legitimate craftsman because he was born from necessity, not privilege.

Use Worker when you need deep architectural reasoning, complex debugging across many files, or cross-domain knowledge synthesis. Switch to him explicitly when the work demands particular strengths.

**Why this beats vanilla Codex CLI:**

- **Multi-model orchestration.** Pure Codex is single-model. DevSquad routes different tasks to different models automatically. GPT for deep reasoning. Gemini for frontend. MiniMax for speed. The right brain for the right job.
- **Background agents.** Fire 5+ agents in parallel. Something Codex simply cannot do. While one agent writes code, another researches patterns, another checks documentation. Like a real dev team.
- **Category system.** Tasks are routed by intent, not model name. `visual-engineering` gets Gemini. `ultrabrain` gets GPT-5.3 Codex. `quick` gets MiniMax. No manual juggling.
- **Accumulated wisdom.** Subagents learn from previous results. Conventions discovered in task 1 are passed to task 5. Mistakes made early aren't repeated. The system gets smarter as it works.

### Advisor: The Strategic Planner

Advisor interviews you like a real engineer. Asks clarifying questions. Identifies scope and ambiguities. Builds a detailed plan before a single line of code is touched.

Press **Tab** to enter Advisor mode, or type `@plan "your task"` from Leader.

### Planner: The Conductor

Planner executes Advisor plans. Distributes tasks to specialized subagents. Accumulates learnings across tasks. Verifies completion independently.

Run `/start-work` to activate Planner on your latest plan.

### Architect: The Consultant

Read-only high-IQ consultant for architecture decisions and complex debugging. Consult Architect when facing unfamiliar patterns, security concerns, or multi-system tradeoffs.

### Supporting Cast

- **Reviewer** — Ruthless reviewer. Validates plans against clarity, verification, and context criteria.
- **Scout** — Fast codebase grep. Uses speed-focused models for pattern discovery.
- **Researcher** — Documentation and OSS code search. Stays current on library APIs and best practices.
- **Multimodal Looker** — Vision and screenshot analysis.

---

## Working Modes

### Upup Mode: For the Lazy

Type `upup` or just `ulw`. That's it.

The agent figures everything out. Explores your codebase. Researches patterns. Implements the feature. Verifies with diagnostics. Keeps working until done.

This is the "just do it" mode. Full automatic. You don't have to think deep because the agent thinks deep for you.

### Advisor Mode: For the Precise

Press **Tab** to enter Advisor mode.

Advisor interviews you like a real engineer. Asks clarifying questions. Identifies scope and ambiguities. Builds a detailed plan before a single line of code is touched.

Then run `/start-work` and Planner takes over. Tasks are distributed to specialized subagents. Each completion is verified independently. Learnings accumulate across tasks. Progress tracks across sessions.

Use Advisor for multi-day projects, critical production changes, complex refactoring, or when you want a documented decision trail.

---

## Agent Model Matching

Different agents work best with different models. DevSquad automatically assigns optimal models, but you can customize everything.

### Default Configuration

Models are auto-configured at install time. The interactive installer asks which providers you have, then generates optimal model assignments for each agent and category.

At runtime, fallback chains ensure work continues even if your preferred provider is down. Each agent has a provider priority chain. The system tries providers in order until it finds an available model.

### Custom Model Configuration

You can override specific agents or categories in your config:

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/devsquad-ai/devsquad/master/assets/devsquad.schema.json",

  "agents": {
    // Main orchestrator: Qwen or Claude work best
    "leader": {
      "model": "qwen/qwen-coder-turbo",
      "ultrawork": { "model": "qwen/qwen-coder-turbo", "variant": "max" }
    },

    // Research agents: cheaper models are fine
    "researcher": { "model": "zai-coding-plan/glm-4.7" },
    "scout": { "model": "github-copilot/grok-code-fast-1" },

    // Architecture consultation: GPT or Claude
    "architect": { "model": "openai/gpt-5.2", "variant": "high" }
  },

  "categories": {
    // Frontend work: Gemini dominates visual tasks
    "visual-engineering": { "model": "google/gemini-3-pro", "variant": "high" },

    // Quick tasks: use the cheapest models
    "quick": { "model": "anthropic/claude-haiku-4-5" },

    // Deep reasoning: GPT-5.3-codex
    "ultrabrain": { "model": "openai/gpt-5.3-codex", "variant": "xhigh" }
  }
}
```

### Model Families

**Chinese models** (optimized for DevSquad):
- Qwen Coder Turbo, Qwen Max, Qwen VL Max
- MiniMax M2.5 — fast and smart for utility tasks
- GLM 5 — Claude-like behavior, good for broad tasks

**Claude-like models** (instruction-following, structured output):
- Claude Opus 4.6, Claude Sonnet 4.6, Claude Haiku 4.5

**GPT models** (explicit reasoning, principle-driven):
- GPT-5.3-codex — deep coding powerhouse
- GPT-5.2 — high intelligence
- GPT-5-Nano — ultra-cheap, fast utility tasks

**Different-behavior models**:
- Gemini 3 Pro — excels at visual/frontend tasks
- Grok Code Fast 1 — optimized for code grep/search

See the [Agent-Model Matching Guide](./agent-model-matching.md) for complete details on which models work best for each agent, safe vs dangerous overrides, and provider priority chains.

---

## Why It's Better Than Pure OpenCode/Claude Code

OpenCode/Claude Code is good. But it's a single agent running a single model doing everything alone.

DevSquad turns that into a coordinated team:

**Parallel execution.** OpenCode/Claude Code processes one thing at a time. DevSquad fires background agents in parallel — research, implementation, and verification happening simultaneously. Like having 5 engineers instead of 1.

**Hash-anchored edits.** OpenCode/Claude Code's edit tool fails when the model can't reproduce lines exactly. DevSquad's `LINE#ID` content hashing validates every edit before applying. Grok Code Fast 1 went from 6.7% to 68.3% success rate just from this change.

**Intent Gate.** OpenCode/Claude Code takes your prompt and runs. DevSquad classifies your true intent first — research, implementation, investigation, fix — then routes accordingly. Fewer misinterpretations, better results.

**LSP + AST tools.** Workspace-level rename, go-to-definition, find-references, pre-build diagnostics, AST-aware code rewrites. IDE precision that vanilla OpenCode/Claude Code doesn't have.

**Skills with embedded MCPs.** Each skill brings its own MCP servers, scoped to the task. Context window stays clean instead of bloating with every tool.

**Discipline enforcement.** Todo enforcer yanks idle agents back to work. Comment checker strips AI slop. Ralph Loop keeps going until 100% done. The system doesn't let the agent slack off.

**The fundamental advantage.** Models have different temperaments. Claude thinks deeply. GPT reasons architecturally. Gemini visualizes. Qwen and MiniMax are fast. Single-model tools force you to pick one personality for all tasks. DevSquad leverages them all, routing by task type. This isn't a temporary hack — it's the only architecture that makes sense as models specialize further. The gap between multi-model orchestration and single-model limitation widens every month. We're betting on that future.

---

## The Intent Gate

Before acting on any request, Leader classifies your true intent.

Are you asking for research? Implementation? Investigation? A fix? The Intent Gate figures out what you actually want, not just the literal words you typed. This means the agent understands context, nuance, and the real goal behind your request.

OpenCode/Claude Code doesn't have this. It takes your prompt and runs. DevSquad thinks first, then acts.

---

## What's Next

- **[Installation Guide](./installation.md)** — Complete setup instructions, provider authentication, and troubleshooting
- **[Orchestration Guide](./orchestration.md)** — Deep dive into agent collaboration, planning with Advisor, and execution with Planner
- **[Agent-Model Matching Guide](./agent-model-matching.md)** — Which models work best for each agent and how to customize
- **[Configuration Reference](../reference/configuration.md)** — Full config options with examples
- **[Features Reference](../reference/features.md)** — Complete feature documentation
- **[Manifesto](../manifesto.md)** — Philosophy behind the project

---

**Ready to start?** Type `upup` and see what a coordinated AI team can do.