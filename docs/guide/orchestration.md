# Orchestration System Guide

DevSquad's orchestration system transforms a simple AI agent into a coordinated development team through **separation of planning and execution**.

---

## TL;DR - When to Use What

| Complexity | Approach | When to Use |
|------------|----------|-------------|
| **Simple** | Just prompt | Simple tasks, quick fixes, single-file changes |
| **Complex + Lazy** | Type `ulw` or `upup` | Complex tasks where explaining context is tedious. Agent figures it out. |
| **Complex + Precise** | `@plan` → `/start-work` | Precise, multi-step work requiring true orchestration. Advisor plans, Planner executes. |

**Decision Flow:**

```
Is it a quick fix or simple task?
  └─ YES → Just prompt normally
  └─ NO  → Is explaining the full context tedious?
              └─ YES → Type "ulw" and let the agent figure it out
              └─ NO  → Do you need precise, verifiable execution?
                         └─ YES → Use @plan for Advisor planning, then /start-work
                         └─ NO  → Just use "ulw"
```

---

## The Architecture

The orchestration system uses a three-layer architecture that solves context overload, cognitive drift, and verification gaps through specialization and delegation.

```mermaid
flowchart TB
    subgraph Planning["Planning Layer (Human + Advisor)"]
        User[(" User")]
        Advisor[" Advisor<br/>(Strategic Planner)<br/>Qwen Coder Turbo"]
        GapAnalyzer[" Gap Analyzer<br/>(Consultant)<br/>Qwen Max"]
        Reviewer[" Reviewer<br/>(Reviewer)<br/>GLM-5"]
    end
    
    subgraph Execution["Execution Layer (Orchestrator)"]
        Orchestrator[" Planner<br/>(Conductor)<br/>MiniMax M2.5"]
    end
    
    subgraph Workers["Worker Layer (Specialized Agents)"]
        Junior[" Junior<br/>(Task Executor)<br/>MiniMax M2.5"]
        Architect[" Architect<br/>(Architecture)<br/>GLM-5"]
        Scout[" Scout<br/>(Codebase Grep)<br/>MiniMax"]
        Researcher[" Researcher<br/>(Docs/OSS)<br/>GLM-4.7"]
        Frontend[" Frontend<br/>(UI/UX)<br/>Gemini 3 Pro"]
    end
    
    User -->|"Describe work"| Advisor
    Advisor -->|"Consult"| GapAnalyzer
    Advisor -->|"Interview"| User
    Advisor -->|"Generate plan"| Plan[".leader/plans/*.md"]
    Plan -->|"High accuracy?"| Reviewer
    Reviewer -->|"OKAY / REJECT"| Advisor
    
    User -->|"/start-work"| Orchestrator
    Plan -->|"Read"| Orchestrator
    
    Orchestrator -->|"task(category)"| Junior
    Orchestrator -->|"task(agent)"| Architect
    Orchestrator -->|"task(agent)"| Scout
    Orchestrator -->|"task(agent)"| Researcher
    Orchestrator -->|"task(agent)"| Frontend
    
    Junior -->|"Results + Learnings"| Orchestrator
    Architect -->|"Advice"| Orchestrator
    Scout -->|"Code patterns"| Orchestrator
    Researcher -->|"Documentation"| Orchestrator
    Frontend -->|"UI code"| Orchestrator
```

---

## Planning: Advisor + Gap Analyzer + Reviewer

### Advisor: Your Strategic Consultant

Advisor is not just a planner, it's an intelligent interviewer that helps you think through what you actually need. It is **READ-ONLY** - can only create or modify markdown files within `.leader/` directory.

**The Interview Process:**

```mermaid
stateDiagram-v2
    [*] --> Interview: User describes work
    Interview --> Research: Launch Scout/Researcher agents
    Research --> Interview: Gather codebase context
    Interview --> ClearanceCheck: After each response
    
    ClearanceCheck --> Interview: Requirements unclear
    ClearanceCheck --> PlanGeneration: All requirements clear
    
    state ClearanceCheck {
        [*] --> Check
        Check: Core objective defined?
        Check: Scope boundaries established?
        Check: No critical ambiguities?
        Check: Technical approach decided?
        Check: Test strategy confirmed?
    }
    
    PlanGeneration --> GapAnalyzerConsult: Mandatory gap analysis
    GapAnalyzerConsult --> WritePlan: Incorporate findings
    WritePlan --> HighAccuracyChoice: Present to user
    
    HighAccuracyChoice --> ReviewerLoop: User wants high accuracy
    HighAccuracyChoice --> Done: User accepts plan
    
    ReviewerLoop --> WritePlan: REJECTED - fix issues
    ReviewerLoop --> Done: OKAY - plan approved
    
    Done --> [*]: Guide to /start-work
```

**Intent-Specific Strategies:**

Advisor adapts its interview style based on what you're doing:

| Intent | Advisor Focus | Example Questions |
|--------|----------------|-------------------|
| **Refactoring** | Safety - behavior preservation | "What tests verify current behavior?" "Rollback strategy?" |
| **Build from Scratch** | Discovery - patterns first | "Found pattern X in codebase. Follow it or deviate?" |
| **Mid-sized Task** | Guardrails - exact boundaries | "What must NOT be included? Hard constraints?" |
| **Architecture** | Strategic - long-term impact | "Expected lifespan? Scale requirements?" |

### Gap Analyzer: The Gap Analyzer

Before Advisor writes the plan, Gap Analyzer catches what Advisor missed:

- Hidden intentions in user's request
- Ambiguities that could derail implementation
- AI-slop patterns (over-engineering, scope creep)
- Missing acceptance criteria
- Edge cases not addressed

**Why Gap Analyzer Exists:**

The plan author (Advisor) has "ADHD working memory" - it makes connections that never make it onto the page. Gap Analyzer forces externalization of implicit knowledge.

### Reviewer: The Ruthless Reviewer

For high-accuracy mode, Reviewer validates plans against four core criteria:

1. **Clarity**: Does each task specify WHERE to find implementation details?
2. **Verification**: Are acceptance criteria concrete and measurable?
3. **Context**: Is there sufficient context to proceed without >10% guesswork?
4. **Big Picture**: Is the purpose, background, and workflow clear?

**The Reviewer Loop:**

Reviewer only says "OKAY" when:
- 100% of file references verified
- ≥80% of tasks have clear reference sources
- ≥90% of tasks have concrete acceptance criteria
- Zero tasks require assumptions about business logic
- Zero critical red flags

If REJECTED, Advisor fixes issues and resubmits. No maximum retry limit.

---

## Execution: Planner

### The Conductor Mindset

Planner is like an orchestra conductor: it doesn't play instruments, it ensures perfect harmony.

```mermaid
flowchart LR
    subgraph Orchestrator["Planner"]
        Read["1. Read Plan"]
        Analyze["2. Analyze Tasks"]
        Wisdom["3. Accumulate Wisdom"]
        Delegate["4. Delegate Tasks"]
        Verify["5. Verify Results"]
        Report["6. Final Report"]
    end
    
    Read --> Analyze
    Analyze --> Wisdom
    Wisdom --> Delegate
    Delegate --> Verify
    Verify -->|"More tasks"| Delegate
    Verify -->|"All done"| Report
    
    Delegate -->|"background=False"| Workers["Workers"]
    Workers -->|"Results + Learnings"| Verify
```

**What Planner CAN do:**
- Read files to understand context
- Run commands to verify results
- Use lsp_diagnostics to check for errors
- Search patterns with grep/glob/ast-grep

**What Planner MUST delegate:**
- Writing or editing code files
- Fixing bugs
- Creating tests
- Git commits

### Wisdom Accumulation

The power of orchestration is cumulative learning. After each task:

1. Extract learnings from subagent's response
2. Categorize into: Conventions, Successes, Failures, Gotchas, Commands
3. Pass forward to ALL subsequent subagents

This prevents repeating mistakes and ensures consistent patterns.

**Notepad System:**

```
.leader/notepads/{plan-name}/
├── learnings.md      # Patterns, conventions, successful approaches
├── decisions.md      # Architectural choices and rationales
├── issues.md         # Problems, blockers, gotchas encountered
├── verification.md   # Test results, validation outcomes
└── problems.md       # Unresolved issues, technical debt
```

---

## Workers: Junior and Specialists

### Junior: The Task Executor

Junior is the workhorse that actually writes code. Key characteristics:

- **Focused**: Cannot delegate (blocked from task tool)
- **Disciplined**: Obsessive todo tracking
- **Verified**: Must pass lsp_diagnostics before completion
- **Constrained**: Cannot modify plan files (READ-ONLY)

**Why MiniMax/GLM is Sufficient:**

Junior doesn't need to be the smartest - it needs to be reliable. With:
1. Detailed prompts from Planner (50-200 lines)
2. Accumulated wisdom passed forward
3. Clear MUST DO / MUST NOT DO constraints
4. Verification requirements

Even a mid-tier model executes precisely. The intelligence is in the **system**, not individual agents.

### System Reminder Mechanism

The hook system ensures Junior never stops halfway:

```
[SYSTEM REMINDER - TODO CONTINUATION]

You have incomplete todos! Complete ALL before responding:
- [ ] Implement user service ← IN PROGRESS
- [ ] Add validation
- [ ] Write tests

DO NOT respond until all todos are marked completed.
```

This "boulder pushing" mechanism is why the system is named after the leader.

---

## Category + Skill System

### Why Categories are Revolutionary

**The Problem with Model Names:**

```typescript
// OLD: Model name creates distributional bias
task(agent="gpt-5.2", prompt="...")  // Model knows its limitations
task(agent="claude-opus-4.6", prompt="...")  // Different self-perception
```

**The Solution: Semantic Categories:**

```typescript
// NEW: Category describes INTENT, not implementation
task(category="ultrabrain", prompt="...")     // "Think strategically"
task(category="visual-engineering", prompt="...")  // "Design beautifully"
task(category="quick", prompt="...")          // "Just get it done fast"
```

### Built-in Categories

| Category | Model | When to Use |
|----------|-------|-------------|
| `visual-engineering` | Gemini 3 Pro | Frontend, UI/UX, design, styling, animation |
| `ultrabrain` | GPT-5.3 Codex (xhigh) | Deep logical reasoning, complex architecture decisions |
| `artistry` | Gemini 3 Pro (max) | Highly creative or artistic tasks, novel ideas |
| `quick` | MiniMax M2.5 | Trivial tasks - single file changes, typo fixes |
| `deep` | GPT-5.3 Codex (medium) | Goal-oriented autonomous problem-solving, thorough research |
| `unspecified-low` | Claude Sonnet 4.6 | Tasks that don't fit other categories, low effort |
| `unspecified-high` | Claude Opus 4.6 (max) | Tasks that don't fit other categories, high effort |
| `writing` | MiniMax M2.5 | Documentation, prose, technical writing |

### Skills: Domain-Specific Instructions

Skills prepend specialized instructions to subagent prompts:

```typescript
// Category + Skill combination
task(
  category="visual-engineering", 
  load_skills=["frontend-ui-ux"],  // Adds UI/UX expertise
  prompt="..."
)

task(
  category="general",
  load_skills=["playwright"],  // Adds browser automation expertise
  prompt="..."
)
```

---

## Usage Patterns

### How to Invoke Advisor

**Method 1: Switch to Advisor Agent (Tab → Select Advisor)**

```
1. Press Tab at the prompt
2. Select "Advisor" from the agent list
3. Describe your work: "I want to refactor the auth system"
4. Answer interview questions
5. Advisor creates plan in .leader/plans/{name}.md
```

**Method 2: Use @plan Command (in Leader)**

```
1. Stay in Leader (default agent)
2. Type: @plan "I want to refactor the auth system"
3. The @plan command automatically switches to Advisor
4. Answer interview questions
5. Advisor creates plan in .leader/plans/{name}.md
```

**Which Should You Use?**

| Scenario | Recommended Method | Why |
|----------|-------------------|-----|
| **New session, starting fresh** | Switch to Advisor agent | Clean mental model - you're entering "planning mode" |
| **Already in Leader, mid-work** | Use @plan | Convenient, no agent switch needed |
| **Want explicit control** | Switch to Advisor agent | Clear separation of planning vs execution contexts |
| **Quick planning interrupt** | Use @plan | Fastest path from current context |

Both methods trigger the same Advisor planning flow. The @plan command is simply a convenience shortcut.

### /start-work Behavior and Session Continuity

**What Happens When You Run /start-work:**

```
User: /start-work
    ↓
[start-work hook activates]
    ↓
Check: Does .leader/boulder.json exist?
    ↓
    ├─ YES (existing work) → RESUME MODE
    │   - Read the existing boulder state
    │   - Calculate progress (checked vs unchecked boxes)
    │   - Inject continuation prompt with remaining tasks
    │   - Planner continues where you left off
    │
    └─ NO (fresh start) → INIT MODE
        - Find the most recent plan in .leader/plans/
        - Create new boulder.json tracking this plan
        - Switch session agent to Planner
        - Begin execution from task 1
```

**Session Continuity Explained:**

The `boulder.json` file tracks:
- **active_plan**: Path to the current plan file
- **session_ids**: All sessions that have worked on this plan
- **started_at**: When work began
- **plan_name**: Human-readable plan identifier

**Example Timeline:**

```
Monday 9:00 AM
  └─ @plan "Build user authentication"
  └─ Advisor interviews and creates plan
  └─ User: /start-work
  └─ Planner begins execution, creates boulder.json
  └─ Task 1 complete, Task 2 in progress...
  └─ [Session ends - computer crash, user logout, etc.]

Monday 2:00 PM (NEW SESSION)
  └─ User opens new session (agent = Leader by default)
  └─ User: /start-work
  └─ [start-work hook reads boulder.json]
  └─ "Resuming 'Build user authentication' - 3 of 8 tasks complete"
  └─ Planner continues from Task 3 (no context lost)
```

Planner is automatically activated when you run `/start-work`. You don't need to manually switch to Planner.

### Worker vs Leader + upup

**Quick Comparison:**

| Aspect | Worker | Leader + `ulw` / `upup` |
|--------|--------|-------------------------|
| **Model** | GPT-5.3 Codex (medium reasoning) | Qwen Coder Turbo (your default) |
| **Approach** | Autonomous deep worker | Keyword-activated upup mode |
| **Best For** | Complex architectural work, deep reasoning | General complex tasks, "just do it" scenarios |
| **Planning** | Self-plans during execution | Uses Advisor plans if available |
| **Delegation** | Heavy use of Scout/Researcher agents | Uses category-based delegation |
| **Temperature** | 0.1 | 0.1 |

**When to Use Worker:**

Switch to Worker (Tab → Select Worker) when:

1. **Deep architectural reasoning needed**
   - "Design a new plugin system"
   - "Refactor this monolith into microservices"

2. **Complex debugging requiring inference chains**
   - "Why does this race condition only happen on Tuesdays?"
   - "Trace this memory leak through 15 files"

3. **Cross-domain knowledge synthesis**
   - "Integrate our Rust core with the TypeScript frontend"
   - "Migrate from MongoDB to PostgreSQL with zero downtime"

4. **You specifically want GPT-5.3 Codex reasoning**
   - Some problems benefit from GPT-5.3 Codex's training characteristics

**When to Use Leader + `ulw`:**

Use the `ulw` keyword in Leader when:

1. **You want the agent to figure it out**
   - "ulw fix the failing tests"
   - "ulw add input validation to the API"

2. **Complex but well-scoped tasks**
   - "ulw implement JWT authentication following our patterns"
   - "ulw create a new CLI command for deployments"

3. **You're feeling lazy** (officially supported use case)
   - Don't want to write detailed requirements
   - Trust the agent to explore and decide

4. **You want to leverage existing plans**
   - If an Advisor plan exists, `ulw` mode can use it
   - Falls back to autonomous exploration if no plan

**Recommendation:**

- **For most users**: Use `ulw` keyword in Leader. It's the default path and works excellently for 90% of complex tasks.
- **For power users**: Switch to Worker when you specifically need GPT-5.3 Codex's reasoning style or want the "AmpCode deep mode" experience of fully autonomous exploration and execution.

---

## Configuration

You can control related features in `devsquad.json`:

```jsonc
{
  "leader_agent": {
    "disabled": false,           // Enable Planner orchestration (default: false)
    "planner_enabled": true,     // Enable Advisor (default: true)
    "replace_plan": true         // Replace default plan agent with Advisor (default: true)
  },
  
  // Hook settings (add to disable)
  "disabled_hooks": [
    // "start-work",             // Disable execution trigger
    // "advisor-md-only"          // Remove Advisor write restrictions (not recommended)
  ]
}
```

---

## Troubleshooting

### "I switched to Advisor but nothing happened"

Advisor enters interview mode by default. It will ask you questions about your requirements. Answer them, then say "make it a plan" when ready.

### "/start-work says 'no active plan found'"

Either:
- No plans exist in `.leader/plans/` → Create one with Advisor first
- Plans exist but boulder.json points elsewhere → Delete `.leader/boulder.json` and retry

### "I'm in Planner but I want to switch back to normal mode"

Type `exit` or start a new session. Planner is primarily entered via `/start-work` - you don't typically "switch to Planner" manually.

### "What's the difference between @plan and just switching to Advisor?"

**Nothing functional.** Both invoke Advisor. @plan is a convenience command while switching agents is explicit control. Use whichever feels natural.

### "Should I use Worker or type ulw?"

**For most tasks**: Type `ulw` in Leader.

**Use Worker when**: You specifically need GPT-5.3 Codex's reasoning style for deep architectural work or complex debugging.

---

## Further Reading

- [Overview](./overview.md)
- [Features Reference](../reference/features.md)
- [Configuration Reference](../reference/configuration.md)
- [Manifesto](../manifesto.md)