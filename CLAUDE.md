# ACE Project Context Guide

## User Memory (Original)

- All claude generated markdowns that generate on progress, on actions specify things should live in @artifacts/

---

## Project Context (Generated from Specs)

This section provides Claude with the complete context of the ACE (Architected Consistency Engine) project for effective collaboration.

> **Source Documents**: This guide synthesizes information from the following specifications:
> - `specs/ai_stack.md` - AI Stack Architecture and Technology Selection
> - `specs/architecture_blueprint.md` - Technical Architecture Blueprint
> - `specs/core_architecture.md` - Core Architecture Implementation Details
> - `specs/implementation_artifact.md` - High-Velocity Parallel Development Blueprint
> - `specs/implementation_blueprint.md` - Detailed Implementation Specifications
> - `specs/implementation_plan.md` - Hyper-Parallel Infrastructure and CI/CD Blueprint

## Project Overview

**ACE** is a high-performance AI tool stack designed for building deep, internally consistent RPG world foundations using Large Language Models (LLMs). The system prioritizes consistency, performance, and cost-efficiency through a sophisticated architecture combining Graph RAG, agent orchestration, and strict validation.

**Primary Source**: `specs/ai_stack.md` (Sections I-II)

## Core Value Proposition

- **Deep Consistency**: Eliminates LLM hallucinations through architectural enforcement rather than probabilistic generation
- **Graph-Based Knowledge**: Uses Neo4j Knowledge Graphs to model complex relationships and enable multi-hop reasoning
- **Hybrid RAG**: Combines vector similarity search with graph-based relational queries
- **Open-Weight Models**: Optimized for cost-efficiency using Ollama, quantization, and performance tuning

## Architectural Pillars

**Source**: `specs/ai_stack.md` (Section I.3), `specs/architecture_blueprint.md` (Section 1.2)

### 1. Enforcement
Consistency is enforced structurally through:
- LangGraph Finite State Machine (FSM) for mandatory validation checkpoints
- Knowledge Graph schema constraints and validation
- Architectural Enforced Consistency (AEC) via conditional workflow transitions

### 2. Traceability
Complete data lineage tracking:
- Prompt version metadata linked to generated content
- Agent workflow execution history
- Ability to trace any inconsistency back to its creation event

### 3. Human Integration
Structured Human-in-the-Loop (HITL):
- Formal checkpoints within LangGraph orchestration
- State pause/resume capabilities
- Clear integration points for subjective decisions (tone, style, theme)

## Technology Stack

**Source**: `specs/ai_stack.md` (Table 3, Sections III-V), `specs/architecture_blueprint.md` (Section 1.3, Table: ACE Core Technology Stack)

### Runtime & Framework
- **Bun**: High-performance JavaScript/TypeScript runtime
- **Monorepo**: Bun Workspaces for shared dependencies and type consistency
- **TypeScript**: Strict typing enforced across all services

### Agent Orchestration
- **LangGraph**: Graph-based FSM for agent workflows (see `specs/ai_stack.md` Section III.1, Table 1)
- **LangSmith**: Observability and debugging
- Conditional execution logic with validation loops

### Knowledge Management
- **Neo4j**: Graph database for relational lore (entities, relationships)
- **Qdrant/Pinecone**: Vector store for semantic similarity search
- **GraphRAG**: Hybrid retrieval combining both approaches (see `specs/ai_stack.md` Section II, `specs/architecture_blueprint.md` Section 3.3)

### LLM Inference
- **Ollama**: Optimized open-weight model serving (see `specs/architecture_blueprint.md` Section 4.2)
- **Quantization**: 4-bit/8-bit model optimization
- **HNSW Indexing**: Fast approximate nearest-neighbor search

### Integration
- **Model Context Protocol (MCP)**: Standardized tool/API access layer (see `specs/ai_stack.md` Section V.2, `specs/core_architecture.md` Section 1.3)
- **Zod**: Schema validation and structured output enforcement
- **JSON Schema**: Constrained LLM output generation

## System Architecture

**Source**: `specs/architecture_blueprint.md` (Section 3.2), `specs/core_architecture.md` (Section 1.1), `specs/implementation_blueprint.md` (Section 1)

### Microservices (apps/)
1. **api-gateway**: MCP endpoints, auth, rate limiting (Bun/Hono)
2. **inference-service**: LangGraph orchestration, hybrid RAG pipeline
3. **ingestion-engine**: Async knowledge graph construction (Bun Workers)
4. **evaluation-service**: LLM-as-a-Judge, regression testing, quality gates

### Shared Packages (packages/)
1. **core-types**: Zod schemas, TypeScript interfaces, shared enums (see `specs/implementation_blueprint.md` Section 1.1.B)
2. **prompt-library**: Version-controlled prompt templates (see `specs/ai_stack.md` Section IV.2)
3. **neo4j-utilities**: Database driver, connection logic, Cypher templates

## Core Workflows

### Knowledge Graph Construction (EDC Pattern)

**Source**: `specs/ai_stack.md` (Section II.2), `specs/architecture_blueprint.md` (Section 4.4)

1. **Extract**: LLM identifies entities and relationships from text
2. **Define**: Classify extracted data against KG ontology
3. **Canonicalize**: Map to canonical entities, prevent duplication

### LangGraph Agent Flow

**Source**: `specs/ai_stack.md` (Section III.2), `specs/core_architecture.md` (Section 3)

1. **Request Processor**: Translates user input to structured state
2. **Historian Agent**: GraphRAG retrieval from Neo4j/Vector store
3. **Narrator Agent**: Generates new lore with structured output (JSON)
4. **Consistency Checker**: Schema validation + multi-hop contradiction checks
5. **Human Review Agent**: Pause for critical decisions/failures

### Validation & Self-Correction

**Source**: `specs/ai_stack.md` (Section III.3), `specs/core_architecture.md` (Section 3.4)

- Output must pass Zod schema validation
- Contextual consistency checked against retrieved facts
- Failed validation triggers automatic retry loop in LangGraph FSM
- Human intervention required for repeated failures

## Development Methodology

### Specification Driven Development (SDD)

**Source**: `specs/architecture_blueprint.md` (Section 2), `specs/implementation_artifact.md` (Section 2)

1. **Specify**: Define business requirements and success criteria
2. **Plan**: Select architecture components, map NFRs to tech
3. **Tasks**: Break down into small, reviewable work units
4. **Implement**: Execute with immediate behavioral verification

### Quality Assurance

**Source**: `specs/architecture_blueprint.md` (Section 5), `specs/implementation_artifact.md` (Section 4)

- **Golden Dataset**: Version-controlled reference inputs/outputs
- **LLM Regression Tests**: Mandatory CD gate (Faithfulness ≥ 97%)
- **Faithfulness Score**: Measure grounding in retrieved context
- **Evidence Coverage**: Completeness of answers vs. available context
- **Answer Accuracy**: Semantic similarity + factual consistency

## Non-Functional Requirements (NFRs)

**Source**: `specs/architecture_blueprint.md` (Section 6, Table: Quantified NFRs for the ACE Project)

| Domain | Target | Architectural Driver |
|--------|--------|---------------------|
| **Latency (P95)** | < 500ms | Bun runtime, Ollama optimization, HNSW indexing |
| **Throughput** | 500 RPS | Microservice architecture, horizontal K8s scaling |
| **Consistency** | Faithfulness > 97% | Graph RAG + SDD specifications |
| **Availability** | 99.99% uptime | Neo4j clustering, redundant inference servers |

## Code Quality Standards

**Source**: `specs/core_architecture.md` (Section 1.2), `specs/implementation_artifact.md` (Section 1.2)

### Tooling
- **Biome**: Unified linting and formatting
- **TypeScript**: `strict: true`, `noImplicitAny: true`
- **Imports**: Monorepo aliases (`@ace/core-types`)

### Naming Conventions
- **Neo4j Node Labels**: PascalCase (`Faction`, `Resource`)
- **Neo4j Relationships**: UPPER_SNAKE_CASE (`CONTROLS_RESOURCE`, `IS_ALLY_OF`)
- **Variables/Functions**: camelCase
- **Interfaces/Types**: PascalCase

## DevOps & Deployment

**Source**: `specs/architecture_blueprint.md` (Section 7), `specs/implementation_plan.md` (Sections II-IV)

### CI/CD Pipeline (GitHub Actions)
1. **Lint & Type Check**: Biome, TypeScript compiler
2. **Unit Tests**: Bun test runner with coverage
3. **Docker Build**: Multi-stage for each service
4. **LLM Regression Gate**: Golden Dataset tests (mandatory)
5. **Deploy**: Rolling/blue-green K8s deployment

### Environments

**Source**: `specs/architecture_blueprint.md` (Section 8.2, Table: Environment Management Matrix)

- **Local**: Synthetic data, small Ollama models
- **Development**: Sanitized production subset, CI target
- **Staging**: Full production snapshot, NFR verification
- **Production**: Live traffic, continuous monitoring

### Monitoring & Observability

**Source**: `specs/architecture_blueprint.md` (Section 7.3), `specs/implementation_plan.md` (Section IV)

- **Prometheus/Grafana**: Latency, throughput, resource metrics
- **OpenTelemetry**: Distributed tracing across microservices
- **ELK Stack**: Centralized logging with PII sanitization
- **Continuous Faithfulness**: Automated quality sampling in production

## Implementation Phases

**Source**: `specs/architecture_blueprint.md` (Section 9), `specs/implementation_plan.md` (Section VI)

### Phase 1: Foundation (Weeks 1-4)
- Monorepo setup (Bun Workspaces)
- Core schemas in `core-types`
- Basic API Gateway + Neo4j/Vector store instances
- CI/CD V1 (lint/test/build)

### Phase 2: RAG Pipeline (Weeks 5-10)
- Ingestion Engine with Bun Workers
- Graph RAG V1 (hybrid retrieval)
- Ollama integration
- Baseline NFR metrics

### Phase 3: QA & Optimization (Weeks 11-16)
- Evaluation Microservice
- Golden Dataset creation (50+ cases)
- Prompt optimization (CoT, few-shot)
- Model quantization, ANN indexing

### Phase 4: Production Readiness (Weeks 17-20)
- Staging environment parity
- Zero-downtime deployment
- NFR verification (< 500ms, > 97% Faithfulness)
- Security audit and go-live

## Key Concepts

### GraphRAG vs. Vector RAG

**Source**: `specs/ai_stack.md` (Section II.1, Table 2), `specs/architecture_blueprint.md` (Section 3.3)

- **Vector RAG**: Fast semantic search, fails on multi-hop reasoning
- **Graph RAG**: Relational context, complex queries, causal relationships
- **Hybrid**: Vector for initial retrieval, Graph for precise context

### Architectural Enforced Consistency (AEC)

**Source**: `specs/ai_stack.md` (Section III.3), `specs/core_architecture.md` (Section 3.4)

LangGraph FSM forces deterministic validation:
- Narrator → Consistency Checker (conditional edge)
- Validation failure → automatic loop back to Narrator
- Self-healing iterative refinement until schema compliance

### Viewpoint Duality

**Source**: `specs/ai_stack.md` (Section II.3), `specs/ai_stack.md` (Section IV.3)

Knowledge Graph models conflicting narratives:
- Events linked to narrative sources via relationships
- Query scoped by source perspective
- Enables "unreliable narrator" scenarios with internal consistency

### Prompt Versioning

**Source**: `specs/ai_stack.md` (Section IV.2), `specs/core_architecture.md` (Section 1.4)

Prompts as critical infrastructure:
- Git-tracked with version IDs
- Linked to generated content via metadata
- Enables rollback and root-cause analysis
- A/B testing for quality vs. token cost

## Concurrent Development Strategy

**Source**: `specs/core_architecture.md` (Section 2), `specs/implementation_artifact.md` (Section 3)

### Bounded Contexts
- **EPIC 1**: Infrastructure (IaC, CI/CD workflows)
- **EPIC 2**: Data Write Path (Ingestion, KGC, Neo4j)
- **EPIC 3**: Execution Path (API, Inference, LangGraph, Validation)

### Non-Conflicting Code

**Source**: `specs/implementation_blueprint.md` (Section 2.3), `specs/implementation_plan.md` (Section II.B)

- Strict TypeScript interfaces in `core-types`
- Independent microservice boundaries
- Transactional Neo4j writes with `MERGE` clauses
- Idempotent operations across all services

### Sub-Agents

**Source**: `specs/core_architecture.md` (Section 2.4, Section 4.3), `specs/implementation_plan.md` (Section V, Table V.1)

- **Coverage Maximizer**: Generates tests on coverage failures
- **Dependency Resolver**: Optimizes CI/CD DAG
- **Performance Refactoring**: Analyzes traces, suggests optimizations

## Repository Structure

**Source**: `specs/core_architecture.md` (Section 1.1), `specs/implementation_artifact.md` (Section 1.1)

```
/one-ace/
├── .gitignore
├── package.json              # Monorepo root with workspaces
├── biome.json                # Unified linting/formatting
├── tsconfig.json             # Strict TypeScript config
├── specs/                    # Design documents (read-only reference)
│   ├── ai_stack.md
│   ├── architecture_blueprint.md
│   ├── core_architecture.md
│   ├── implementation_artifact.md
│   ├── implementation_blueprint.md
│   └── implementation_plan.md
├── artifacts/                # Claude-generated progress docs
├── apps/                     # Microservices
│   ├── api-gateway/
│   ├── inference-service/
│   ├── ingestion-engine/
│   └── evaluation-service/
├── packages/                 # Shared libraries
│   ├── core-types/
│   ├── prompt-library/
│   └── neo4j-utilities/
└── .github/
    └── workflows/            # CI/CD pipelines
```

## Important Notes for Claude

**Source**: User configuration and `specs/implementation_plan.md` (Section VII)

### All Progress Artifacts → /artifacts/
Per user configuration, all progress reports, implementation logs, and generated markdown documents should be saved to `/artifacts/` directory.

### Prioritize Consistency

**Source**: `specs/ai_stack.md` (Section I.2), `specs/architecture_blueprint.md` (Section 6.1)

- Schema validation is mandatory, not optional
- Faithfulness > speed
- Never bypass validation loops
- Human review required for critical failures

### Performance Targets

**Source**: `specs/architecture_blueprint.md` (Section 6.2), `specs/architecture_blueprint.md` (Section 6.4)

- P95 latency must stay < 500ms
- Balance quality improvements against token cost
- Optimize retrieval (ANN, Cypher) as much as LLM inference

### Testing Philosophy

**Source**: `specs/architecture_blueprint.md` (Section 5.1-5.3), `specs/implementation_artifact.md` (Section 4.1-4.2)

- Golden Dataset is single source of truth
- LLM outputs are probabilistic → test behaviors, not exact matches
- Regression tests are mandatory CD gates
- Coverage threshold: 85%+ line coverage

### Agent Workflow

**Source**: `specs/implementation_plan.md` (Section V.A-V.B), `specs/core_architecture.md` (Section 4.3)

- Sub-agents submit PRs, never direct commits
- Specialized, narrow boundaries prevent conflicts
- Monitor acceptance rates for agent quality
- Asynchronous execution via message queues

### Security & Compliance

**Source**: `specs/architecture_blueprint.md` (Section 8.3), `specs/implementation_plan.md` (Section I.A)

- Never commit secrets to repo
- Use K8s Secrets/Vault for credentials
- Policy-as-Code (Sentinel/OPA) for IaC validation
- PII sanitization in logs

---

## Reference Documentation Map

For detailed technical specifications, consult:

| Topic | Primary Source Document |
|-------|------------------------|
| **AI Stack & Technology Selection** | `specs/ai_stack.md` |
| **LangGraph Orchestration** | `specs/ai_stack.md` (Section III), `specs/core_architecture.md` (Section 3) |
| **GraphRAG Architecture** | `specs/ai_stack.md` (Section II), `specs/architecture_blueprint.md` (Section 3.3) |
| **Bun Runtime & Microservices** | `specs/architecture_blueprint.md` (Sections 3-4) |
| **SDD Methodology** | `specs/architecture_blueprint.md` (Section 2), `specs/implementation_artifact.md` (Section 2) |
| **Testing & QA Framework** | `specs/architecture_blueprint.md` (Section 5) |
| **NFRs & Performance** | `specs/architecture_blueprint.md` (Section 6) |
| **CI/CD Pipeline** | `specs/architecture_blueprint.md` (Section 7), `specs/implementation_plan.md` (Section II) |
| **Monorepo Structure** | `specs/core_architecture.md` (Section 1), `specs/implementation_artifact.md` (Section 1) |
| **Parallel Development** | `specs/implementation_artifact.md` (Section 3), `specs/implementation_blueprint.md` (Section 2) |
| **Infrastructure as Code** | `specs/implementation_plan.md` (Section I) |
| **Sub-Agent Architecture** | `specs/implementation_plan.md` (Section V), `specs/core_architecture.md` (Section 4.3) |
| **Implementation Roadmap** | `specs/architecture_blueprint.md` (Section 9), `specs/implementation_plan.md` (Section VI) |

---

**Last Updated**: 2025-11-09
**Project Phase**: Specification Complete, Ready for Implementation
**Next Steps**: Phase 1 Foundation - Monorepo initialization

## Agent Ecosystem

### Available Agents
- **architecture-validator** – Enforces architectural rules (schema ↔ ontology alignment, structured output, naming, state immutability)
- **test-generator** – Generates unit/integration/LLM tests and reports coverage deltas toward the 85% target
- **dependency-mapper** – Builds dependency graphs, detects cycles, and produces optimized CI/CD execution DAGs
- **documentation-sync** – Synchronizes OpenAPI specs, MCP tool definitions, and JSDoc comments with code changes
- **schema-evolution** – Detects schema diffs, generates Neo4j migrations/rollbacks, and validates data safety
- **prompt-optimizer** – Runs prompt A/B testing, cost/quality optimization, and manages prompt version deployments
- **performance-profiler** – Analyzes traces, queries, and vector search to recommend performance optimizations
- **agent-orchestrator** – Plans and executes workflows across sub-agents with dependency awareness
- **agent-framework-architect** – Designs and maintains shared agent abstractions, integrations, and developer guidance
- **deployment-ops-specialist** – Creates deployment scripts, monitoring assets, cost reports, and operational runbooks

### Agent Usage Guidelines
- **Architecture changes or LangGraph updates** → run `architecture-validator`
- **New code lacking tests or coverage drops** → run `test-generator`
- **Import/package topology changes or CI slowdowns** → run `dependency-mapper`
- **API/schema modifications or missing docs** → run `documentation-sync`
- **Neo4j/Zod schema adjustments or ontology revisions** → run `schema-evolution`
- **Prompt quality or cost regressions** → run `prompt-optimizer`
- **Latency/cost alerts or weekly performance audits** → run `performance-profiler`
- **Coordinated PR/daily/weekly workflows** → invoke `agent-orchestrator`
- **New agent scaffolding or framework refactors** → consult `agent-framework-architect`
- **Operational readiness, monitoring, or cost tracking** → engage `deployment-ops-specialist`

### Agent Loop Best Practices
All ACE agents follow Anthropic’s gather → act → verify loop:
1. **Gather Context** – load relevant files, metrics, or historical data before acting
2. **Take Action** – perform analysis, generation, or optimization steps respectably
3. **Verify Work** – validate results, enforce safety checks, and produce reports
Each agent’s `.claude/agents/<name>.md` file documents specific strategies, subagent usage, and verification routines aligned with this loop.

### Agent Orchestration
- PR workflows: run `architecture-validator` first, then parallel analysis agents (`dependency-mapper`, `documentation-sync`, `schema-evolution`), followed by `test-generator`; optional agents (`prompt-optimizer`, `performance-profiler`) execute when policies demand
- Daily workflows: lightweight validation + coverage (`architecture-validator`, `test-generator`)
- Weekly workflows: deep optimization (`prompt-optimizer`, `performance-profiler`) and any backlog tasks surfaced by orchestrator
See `.claude/agents/agent-orchestrator.md` for detailed execution plans, dependency graphs, and failure handling rules.

### Task Assignment
The mapping between agents and implementation tasks is maintained in `artifacts/implementation-tasks.md` ("Agent Task Assignment Matrix"). Consult that section to determine which agent automates or supports specific backlog items and how to incorporate agents into parallel development plans.