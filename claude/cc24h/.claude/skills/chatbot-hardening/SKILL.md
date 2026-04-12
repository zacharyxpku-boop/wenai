---
name: chatbot-hardening
description: "Workflow: Assess and harden a Chatbot/Agent/LLM product from demo to production. Gap analysis + improvement plan."
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
argument-hint: "<project path or specific AI module to assess>"
---

# Chatbot Hardening

Systematically assess and improve an AI/Chatbot/Agent product's production readiness.

## Trigger Phrases
- "这个 chatbot 能上线吗"
- "AI 功能需要加固"
- "从 demo 到上线还差什么"
- "对话系统需要工程化"
- "chatbot hardening"
- "AI 产品工程化评估"
- "这个 agent 稳定性不够"
- "对话质量需要提升"

## Default Participants
- AI应用工程官 (lead): full assessment
- 铁律官: architecture review
- 尺子官: quality gate

## Phase 1: Codebase Scan

1. Identify AI/LLM/Chatbot modules:
   ```bash
   grep -r "openai\|anthropic\|langchain\|llamaindex\|chat\|completion\|agent\|tool_call\|function_call" --include="*.{ts,js,py,tsx,jsx}" -l
   ```
2. Map the AI architecture:
   - Where are prompts defined?
   - How is conversation state managed?
   - What tools/functions are registered?
   - Is there a memory/storage layer?
   - How are errors handled?
   - Is there streaming?

## Phase 2: Production Gap Analysis

Assess each dimension:

### Dialog State
- [ ] Multi-turn context maintained across messages
- [ ] Clear conversation phases/states
- [ ] Graceful handling of topic switches
- [ ] Recovery from misunderstandings
- [ ] Session timeout/cleanup

### Tool Calling
- [ ] Tools registered dynamically (not hardcoded)
- [ ] Calling decision is context-aware
- [ ] Parameters validated before calling
- [ ] Tool failures handled gracefully
- [ ] Results formatted for user understanding

### Memory
- [ ] Session memory persists across messages
- [ ] Long-term memory (if needed) with cleanup
- [ ] No memory pollution (wrong facts persisting)
- [ ] Memory doesn't grow unbounded

### Prompt Engineering
- [ ] System prompt versioned and testable
- [ ] Few-shot examples maintained
- [ ] Output format enforced and parsed
- [ ] Injection protection in place

### Integration
- [ ] External APIs have timeout/retry
- [ ] Authentication refreshed properly
- [ ] Knowledge base up to date
- [ ] MCP/tools have error boundaries

### Reliability
- [ ] AI call failures have fallback responses
- [ ] Streaming handles disconnects
- [ ] Token limits respected (no truncation surprises)
- [ ] Rate limits handled (exponential backoff)

### Observability
- [ ] Response latency tracked
- [ ] Success/failure rate tracked
- [ ] Token usage tracked
- [ ] Conversation quality signals captured

### Testing
- [ ] Core conversation paths have automated tests
- [ ] Edge case inputs tested
- [ ] Regression detection for prompt changes
- [ ] Quality baseline established

## Phase 3: Output

```markdown
# Chatbot Hardening Assessment: <product>
Date: <ISO>
AI Modules Found: <N files>

## Production Gap Analysis
| Dimension | Score (1-5) | Status | Key Gap | Priority |
|-----------|-------------|--------|---------|----------|
| Dialog State | 2 | Weak | No state machine | P1 |
| Tool Calling | 3 | OK | No error handling | P2 |
| Memory | 1 | Missing | Session only | P1 |
| Prompts | 3 | OK | Not versioned | P3 |
| Integration | 2 | Weak | No retry/timeout | P1 |
| Reliability | 2 | Weak | No fallback | P1 |
| Observability | 1 | Missing | No monitoring | P2 |
| Testing | 1 | Missing | No AI tests | P1 |

## Overall Readiness: NOT READY / CONDITIONAL / READY

## Architecture Hardening Plan
### Phase A: Critical (do before any launch)
1. <specific improvement>
2. ...

### Phase B: Important (do before scaling)
1. ...

### Phase C: Nice-to-have (post-launch)
1. ...

## Dialog Improvement Plan
1. <specific dialog issue> → <fix approach>

## Specific Code Recommendations
- <file>:<line> — <what to change>

## Recommended Task Breakdown
(Auto-feeds into execution-plan.yaml)
- task-1: Add conversation state machine
- task-2: Add tool calling error handlers
- task-3: Implement response fallbacks
- ...
```

## Phase 4: Generate Tasks

Convert the hardening plan into executable cc24h tasks:
- Each gap becomes a task with clear done_definition
- Priority matches the gap analysis
- Dependencies respect the phase order (A before B before C)
- Risk levels: dialog/memory changes = medium, prompt changes = low, integration = high

## Risk Guardrails
- L2-L3: reads code, may suggest edits
- Does NOT auto-modify prompt files without review
- Does NOT change production configs
- All suggested changes go through normal build-feature → review cycle
- High-risk items (auth, data, external APIs) flagged for manual review

## Persistence
- Save assessment to `docs/ai-engineering/<product-slug>-hardening.md`
- Generate tasks to `tasks/chatbot-hardening-plan.yaml`
- Update docs/progress.md

## Handoff
- Feeds into: build-feature (implementation), review-and-recover (verification)
- AI应用工程官's subagents execute the specific improvements
- 尺子官 reviews each completed improvement
