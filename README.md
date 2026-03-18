# DevSquad

> The Best AI Agent Harness - Optimized for Chinese Models (Qwen, MiniMax, GLM)

DevSquad is a powerful OpenCode plugin that transforms your AI coding assistant into a coordinated development team. Built on the foundation of opencode, with optimized defaults for Chinese AI models.

## Features

- 🤖 **Multi-Agent Orchestration** - Leader coordinates Worker, Architect, Researcher, Scout and more
- ⚡ **One-Command Power** - Type `upup` and watch your AI team ship code
- 🔗 **Hash-Anchored Editing** - Zero stale-line errors with LINE#ID content validation
- 🛠️ **LSP + AST-Grep** - IDE-level precision for refactoring and code analysis
- 🧠 **Parallel Agents** - Fire multiple specialists simultaneously
- 📚 **Built-in MCPs** - Web search, docs lookup, GitHub code search
- 🔁 **Ralph Loop** - Self-referential development until 100% complete
- ✅ **Todo Enforcer** - Tasks never get abandoned

## Quick Install

### For AI Agents

Paste this to your LLM agent (Claude Code, Cursor, etc.):

```
Install and configure devsquad by following the instructions here:
https://github.com/devsquad-ai/devsquad/blob/master/docs/guide/installation.md
```

### For Humans

```bash
# Using bun (recommended)
bunx devsquad install

# Using npx
npx devsquad install
```

That's it! After installation, just type `upup` and your AI team goes to work.

## Supported Models

DevSquad is optimized for Chinese models out of the box:

| Provider | Models |
|----------|--------|
| **Qwen** (Alibaba) | qwen-coder-turbo, qwen-max, qwen-vl-max |
| **MiniMax** | minimax-m2.5-free |
| **GLM** (Zhipu) | glm-5, glm-4v |

Also supports: Claude, GPT, Gemini as fallbacks.

## Agents

| Agent | Role | Default Model |
|-------|------|---------------|
| **Leader** | Main orchestrator | qwen-coder-turbo |
| **Worker** | Autonomous deep worker | minimax-m2.5-free |
| **Architect** | Architecture consultant | glm-5 |
| **Researcher** | Docs/code search | minimax-m2.5-free |
| **Scout** | Codebase exploration | minimax-m2.5-free |
| **Planner** | Strategic planning | qwen-max |
| **Advisor** | Plan consultant | qwen-max |
| **Reviewer** | Code review | glm-5 |

## Commands

- `upup` - Start a full development session
- `/start-work` - Interview-mode planning
- `/upup-loop` - Ralph loop for continuous work
- `/init-deep` - Auto-generate AGENTS.md hierarchy
- `/refactor` - Intelligent refactoring

## Documentation

- [Installation Guide](docs/guide/installation.md)
- [Configuration Reference](docs/reference/configuration.md)
- [Features Overview](docs/reference/features.md)

## License

SUL-1.0 - See LICENSE.md

## Credits
Built on the shoulders of giants - inspired by Claude Code, OpenCode, and AmpCode.
Thank you to Oh-My-OpenCode (oh-my-opencode) for laying the foundation.
