-----

# ACE Implementation Artifact: High-Velocity Parallel Development Blueprint

## Section 1: Foundational Setup and Code Governance

This section defines the core Monorepo structure, tool installation, and mandated code standards required for consistency and parallel collaboration.

### 1.1. Monorepo Structure and Initialization (Bun Workspaces)

The Monorepo, managed by Bun Workspaces, enforces shared dependencies, type consistency, and clear boundaries between services (`apps`) and shared libraries (`packages`).

| Artifact/Command | Implementation Detail | Rationale |
| :--- | :--- | :--- |
| **`package.json`** | Defines `workspaces: ["apps/*", "packages/*"]` and required dependencies. | Enables Bun to manage shared `node_modules` efficiently. |
| **Monorepo Structure** | **`/apps`**: `api-gateway`, `inference-service`, `ingestion-engine`, `evaluation-service`. **`/packages`**: `core-types`, `prompt-library`, `neo4j-utilities`. | Enforces Bounded Contexts: services are separated, shared code is centralized. |
| **Installation CLI** | `bun install langchain @langchain/core @langchain/openai zod neo4j-driver` | Installs core LangChain/LangGraph, the data contract library (Zod), and the Graph DB driver. |

### 1.2. Mandated Code Quality and Linting Guidelines

To guarantee high code quality and consistency across parallel teams, **Biome** is mandated as the unified linter and formatter, leveraging Bun's native efficiency.

| Component | Standard/Configuration | Rationale |
| :--- | :--- | :--- |
| **Linter/Formatter** | **Biome (`biome.json`)** | Use `biome check --apply` for formatting/linting on save/commit hook. |
| **Code Guidelines** | **Max Line Length:** 100 characters. **Quote Style:** Single quotes (`'`). **Semicolons:** Always enforced. | Centralized configuration eliminates code style conflicts between parallel developers. |
| **TypeScript Typing** | **`tsconfig.json`** must enforce `strict: true` and a clear module resolution path for shared `packages/core-types`. | Guarantees type safety and validates the structure of LLM outputs against Zod schemas. |
| **Naming Conventions** | **Variables/Functions:** `camelCase`. **Interfaces/Types/Classes:** `PascalCase`. **Neo4j Node Labels:** `PascalCase` (e.g., `Faction`, `Resource`). **Neo4j Relationship Types:** `UPPER_SNAKE_CASE` (e.g., `CONTROLS_RESOURCE`). | Enforces consistency between the application code, TypeScript types, and the Neo4j schema. |

### 1.3. Definition of Installed vs. Self-Created Packages

| Package Type | Location | Purpose |
| :--- | :--- | :--- |
| **Installed (External)** | Defined in root `package.json` | LangChain, Zod, Neo4j Driver, Ollama Client. |
| **Self-Created (Shared)** | `packages/core-types` | Zod schemas (the architectural contract), shared TypeScript interfaces, and enum definitions. |
| **Self-Created (Shared)** | `packages/prompt-library` | All version-controlled prompt templates (e.g., `narrator.prompt.txt`, `validation.prompt.txt`). [1] |
| **Self-Created (Services)** | `apps/*` | Business logic, API endpoints, LangGraph flows. |

-----

## Section 2: Specification Driven Development (SDD) Artifacts

The foundation of non-conflicting code starts with a shared, structured *specification* that all parallel implementation teams and agents must reference.

### 2.1. SDD Artifact Example: The Faction Creation Journey

The SDD workflow begins with the **Specify** phase, which defines the user's requirement and success criteria [2, 3]:

| SDD Phase | Artifact Detail |
| :--- | :--- |
| **1. Specify (User Journey)** | **Goal:** A writer wants to generate a new, fully connected `Faction` that logically conflicts with an existing faction (`The Royal Hegemony`). **Success Criteria:** The generated `Faction` must adhere to the `FactionSchema` (strict JSON output) and must have **zero** factual contradictions with the retrieved context about `The Royal Hegemony` (Faithfulness \> 97%). [4, 5] |
| **2. Plan (Architectural Contract)** | **Contract Artifact:** `packages/core-types/FactionSchema.ts`. This Zod schema is the single source of truth for the data structure. |
| **3. Task Generation** | Tasks are generated as small, non-conflicting units (see Section 3). |

### 2.2. Core Data Contract: Faction Creation Schema (Zod/JSON Schema)

This schema defines the output contract, guaranteeing that the `NarratorAgent` (running in parallel) produces a structured result that the `IngestionEngine` can consume without complex runtime parsing errors. [6, 7]

```typescript
// packages/core-types/FactionSchema.ts
import * as z from 'zod';

export const FactionSchema = z.object({
  id: z.string().uuid().describe("Unique identifier for the Faction."),
  name: z.string().describe("The canonical name of the Faction."),
  alignment: z.enum(['Lawful_Evil', 'Chaotic_Neutral', 'Other']).describe("Moral and ethical alignment."),
  core_motivation: z.string().describe("The primary, driving goal of the Faction."),
  leader_name: z.string().describe("Name of the Faction's current leader."),
  controlled_resources: z.array(z.string()).describe("List of strategic resources controlled (e.g., 'Aetherium Mines')."),
  relationship_to_hegemony: z.enum().describe("The calculated relationship to The Royal Hegemony."),
  justification: z.string().describe("LLM's internal justification for its alignment and motivations (for self-reflection)."),
});

export type Faction = z.infer<typeof FactionSchema>;

// CLI: bun run tsc --emitDeclarationOnly # ensures types are generated for all apps
```

-----

## Section 3: Hyper-Parallel Implementation Plan (Epics and Stories)

Tasks are grouped into Epics that can be assigned to different teams or concurrent sub-agents. The key to non-conflicting parallel code is ensuring each EPIC writes to a distinct system component or repository path (bounded context).

### EPIC A: Infrastructure & Deployment (CI/CD Team Focus)

**Bounded Context:** IaC, Kubernetes, CI/CD Workflow (`.github/workflows`).

| Story/Task | To-Do (Actionable CLI/Code) | Parallelization/Conflict Mitigation |
| :--- | :--- | :--- |
| **A.1: Monorepo & Base Setup** | **CLI:** `bun init -y && bun install`. Configure root `package.json` with workspaces and `biome.json`. | Must be completed sequentially first. |
| **A.2: Dockerization** | Create isolated Dockerfiles for `inference-service` (GPU/Ollama base image) and `api-gateway` (lightweight Bun base). [8, 9] | Parallelize Dockerfile creation for the two services. |
| **A.3: CI/CD Workflow** | Implement GitHub Actions workflow (`.github/workflows/ci.yml`). Define job dependencies for `lint`, `test`, `build`, and `docker_push`. [10] | **Parallelize:** `lint` and `unit_test` jobs can run concurrently. |
| **A.4: Monitoring Base** | Deploy Prometheus/Grafana and configure Bun’s OpenTelemetry (or similar) collector integration into the Docker base images. | **Non-Conflicting:** Writes only to a dedicated `monitoring` namespace/service. |

### EPIC B: Data Ingestion & Write Path (Ingestion Team Focus)

**Bounded Context:** `apps/ingestion-engine`, `neo4j-utilities`. **Primary Write Target:** Neo4j Knowledge Graph.

| Story/Task | To-Do (Actionable CLI/Code) | Parallelization/Conflict Mitigation |
| :--- | :--- | :--- |
| **B.1: Neo4j Driver Setup** | Create `packages/neo4j-utilities/Driver.ts` using the official Neo4j driver (JavaScript/TypeScript compatible). | Independent of API/Inference code. |
| **B.2: KGC Pipeline V1** | Implement the **Extract-Define-Canonicalize (EDC)** workflow within `ingestion-engine`. Use LLM to extract entities/relationships from unstructured text. [11, 12] | **Parallelize:** Use Bun Workers (`new Worker()`) to concurrently process different source documents/files. |
| **B.3: Graph Write Logic** | Develop transaction logic in `ingestion-engine` using Cypher to `MERGE` nodes and relationships, ensuring entity disambiguation. [12] | **Conflict Mitigation:** Use highly granular, optimistic locking on the Neo4j schema (e.g., `ON CREATE SET...`) to prevent conflicting concurrent writes. |

### EPIC C: Inference and Read Path (API/Agent Team Focus)

**Bounded Context:** `apps/api-gateway`, `apps/inference-service`, `LangGraph` flow definitions. **Primary Read Target:** Neo4j KG.

| Story/Task | To-Do (Actionable CLI/Code) | Parallelization/Conflict Mitigation |
| :--- | :--- | :--- |
| **C.1: MCP Server Setup** | Implement `apps/api-gateway/index.ts` using Bun’s native HTTP server (or Hono/Elysia) to expose the Model Context Protocol (MCP) endpoints. | Independent of Ingestion and Evaluation services. |
| **C.2: Agent Orchestration** | Define the core LangGraph FSM in `apps/inference-service`. Create the `HistorianAgent` and `NarratorAgent` nodes. [13, 14] | **Parallelize:** The RAG pipeline is inherently sequential, but the `Inference Service` can scale horizontally via K8s to handle concurrent user requests. |
| **C.3: Structured Output Enforcement**| Configure the `NarratorAgent` to mandate output adherence to `packages/core-types/FactionSchema.ts` via Zod’s `withStructuredOutput` helper. | **Non-Conflicting:** Guaranteed structured output simplifies downstream processing and prevents schema conflicts. |

-----

## Section 4: Testing Strategy, Coverage, and Sub-Agent Integration

The core of consistency lies in test coverage and quality gating, leveraging autonomous agents to drive efficiency in the parallel workflow.

### 4.1. The Testing Strategy: LLM-Native and Unit Tests

| Test Type | Tooling | Coverage Focus |
| :--- | :--- | :--- |
| **Unit Tests** | **Bun Test Runner** (`bun test`) | Focus on deterministic helper functions, data validation (`Zod`), and utility code quality (e.g., input parsing, prompt assembly). |
| **Integration Tests** | Bun Test Runner, Ephemeral K8s Pods | Verify service connectivity (e.g., `InferenceService` successfully queries `Neo4j` and calls `Ollama`). |
| **LLM Regression Tests**| **Evaluation Microservice**, Golden Dataset [15] | Test adherence to Consistency NFRs (Faithfulness, Answer Accuracy). **Must be a mandatory CD gate.** [5, 16] |

### 4.2. Quality Gate Definition and LLM Metrics

The CI/CD pipeline must enforce these metrics as mandatory gates before deployment can proceed:

| Metric (KPI) | Target | Verification Method | Quality Gate Trigger |
| :--- | :--- | :--- | :--- |
| **Code Coverage** | $\ge 85\%$ (Line Coverage) | **Bun Test Runner**, integrated into CI. | Failure to meet threshold triggers the **Coverage Maximizer Agent** (Async). |
| **Faithfulness Score** | $\ge 97\%$ | **Evaluation Microservice** (LLM-as-a-Judge) compares output against context. [4] | Breach of target halts CD; requires manual review and prompt refactoring. |
| **Biome Errors** | Zero | **Biome Linter** (`biome check`). | Failure halts CI immediately ("Fail Fast"). |

### 4.3. Integrating Autonomous Sub-Agents for Parallelization

To supplement the parallel human workflow and non-conflicting code mandate, specialized agents will perform asynchronous tasks, primarily driven by the central **Evaluation Microservice**.

| Sub-Agent Role | Trigger/Input | Action and Non-Conflicting Output |
| :--- | :--- | :--- |
| **Coverage Maximizer Agent** | `CI/CD Failure`: Code Coverage is below 85% threshold. | **Action:** Reads coverage report. **Output:** Generates new, targeted test files in a dedicated feature branch. **Conflict Mitigation:** Writes only to the `/apps/*/tests/agent-generated` directory. [17] |
| **Dependency Resolver Agent**| `Pre-CI Trigger`: New Pull Request opened or merged to `main`. | **Action:** Scans Monorepo for `import` statements and shared resource usage. **Output:** Generates optimized parallelization DAG for the CI/CD orchestrator. **Conflict Mitigation:** Read-only analysis; output is a JSON config, not code. |
| **Performance Refactoring Agent**| `Monitoring Alert`: Latency NFR breach (e.g., P95 \> 500ms). | **Action:** Analyzes OpenTelemetry traces to identify bottleneck (e.g., slow Cypher query). **Output:** Suggests an index update or simple code refactoring (e.g., in `HistorianAgent`). **Conflict Mitigation:** Submits a PR for human review; never commits directly. |

## Section 5: Development Environment and Persistence

### 5.1. Running the Local Dev Environment

The Bun runtime is central to minimizing setup friction and maximizing iteration speed.

**Prerequisites:** Bun installed, Docker/Podman running (for Neo4j/Ollama).

1.  **Start Services:** Use Docker Compose (or Bun Scripts) to spin up the local Graph DB (Neo4j) and the local LLM Server (Ollama).
      * **CLI:** `docker compose up -d neo4j ollama`
2.  **Run Development Servers:** Start the local microservices using Bun's native run command.
      * **CLI:** `bun dev --cwd apps/api-gateway` (Fast startup, hot reloading).
      * **CLI:** `bun dev --cwd apps/inference-service`
3.  **Run Local Tests:** Use Bun’s built-in test runner.
      * **CLI:** `bun test --coverage` (Run tests across the entire Monorepo).

### 5.2. Persisting Results: Code Form and Human Readable

All generated artifacts must be persisted in a way that is both machine-readable (for integration) and human-auditable (for review).

| Artifact | Persistence Format | Location | Rationale (Human/Code) |
| :--- | :--- | :--- | :--- |
| **Lore Generation** | **Structured JSON/Zod Type** | Neo4j KG (Nodes/Edges/Properties) | **Code:** Directly consumable by `HistorianAgent`. **Human:** Viewable via Neo4j Bloom/Browser for domain expert review. [18] |
| **Prompts** | **Versioned Text Files** | `packages/prompt-library` (Git-tracked) | **Code:** Used by `NarratorAgent`. **Human:** Allows version history and comparison via Git diff. [1] |
| **Test Cases** | **TypeScript/JSON** | `apps/evaluation-service/golden-dataset/v1.json` | **Code:** Parsed by `Evaluation Microservice`. **Human:** Easy to read and verify expected input/output. [15] |
| **LangGraph Flow** | **TypeScript Code** | `apps/inference-service/workflow.ts` | **Code:** Executed by LangGraph. **Human:** Logic is defined declaratively for auditability. [13] |

### 5.3. Software Architecture Concerns in Parallel Development

| Concern | Mitigation Strategy | Architectural Component Responsible |
| :--- | :--- | :--- |
| **Non-Deterministic Outputs** | Use the LLM Regression Test gate against a **Golden Dataset** (Section 4.2). | Evaluation Microservice (SDD/QA Artifact). |
| **Dependency Confusion** | Strict Monorepo package management using **Bun Workspaces** and internal `core-types` package. | Bun Runtime & `core-types` package. |
| **Resource Contention** | Run all parallel CI/CD jobs as isolated **Kubernetes Jobs** with enforced resource quotas. | K8s/IaC Foundation (EPIC A). |
| **Data Staleness** | Segregate high-throughput RAG queries (read) from asynchronous ingestion (write). Implement a **data version tag** on the Neo4j context. | Ingestion Engine (EPIC B). |