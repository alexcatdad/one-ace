This document serves as the high-fidelity implementation blueprint for the Architected Consistency Engine (ACE). It translates the abstract architectural principles into concrete, actionable Epics and Stories, ensuring parallel development adheres to rigorous code quality and structural consistency mandates.

The strategy focuses on **Specification Driven Development (SDD)**, **Bun Monorepo Workspaces**, and **strict bounded contexts** to eliminate conflicting code and maximize concurrent velocity.

---

## Section 1: Core Architectural Assets and Governance

### 1.1. Monorepo Structure and Bounded Contexts

The ACE project uses a **Monorepo** (Bun Workspaces) [1] to maximize code sharing and enforce consistency across all four critical microservices (Apps) and shared libraries (Packages). This structure ensures that development teams working in parallel on different services (e.g., API vs. Ingestion) are highly decoupled in their application logic but unified by shared data contracts (`core-types`).

#### A. Defined Applications (Apps - Independent Microservices)

| App Name | Bounded Context / Primary Role | Bun Run Command (Example) | Deployment Target |
| :--- | :--- | :--- | :--- |
| **`api-gateway`** | **External Interface / Routing.** Exposes the public-facing Model Context Protocol (MCP) endpoints. | `bun run start:api` | Kubernetes (K8s) Cluster - Edge Layer |
| **`inference-service`** | **Core Logic / Orchestration.** Hosts the **LangGraph** FSM and executes the hybrid Graph RAG pipeline. | `bun run start:inference` | K8s Cluster - Application Layer |
| **`ingestion-engine`** | **Write Path / KGC.** Asynchronous service using Bun Workers for Knowledge Graph Construction (KGC) and Neo4j writes. | `bun run start:ingest` | K8s Cluster - Background Worker Pool |
| **`evaluation-service`** | **QA / Testing Engine.** Isolated service for LLM-as-a-Judge, running regression tests against the Golden Dataset. | `bun run test:eval` | K8s Cluster - Ephemeral/Testing Namespace |

#### B. Self-Created Packages (Libraries - Shared Dependencies)

These packages contain the immutable contracts and utilities used by all Apps, preventing conflicting definitions.

| Package Name | Primary Content | Rationale |
| :--- | :--- | :--- |
| **`core-types`** | All Zod Schemas (e.g., `FactionSchema`, `EventSchema`), TypeScript Interfaces, and Shared Enums. | Enforces **Architectural Enforced Consistency (AEC)** by making data validation the single source of truth for structured output. [2, 3] |
| **`prompt-library`** | All version-controlled prompt templates (`narrator.txt`, `validator.txt`), organized by agent role and version. | Enables **Prompt Versioning and Management** [4] for safe A/B testing and rollback capability. [5] |
| **`neo4j-utilities`** | Singleton Neo4j Driver instance, connection logic, and validated Cypher query templates. | Centralizes database connection and ensures all services use the same connection logic and secure parameters. |

### 1.2. Code Quality and Linting Guidelines (Biome Mandate)

All code must adhere to centralized, mandatory quality standards managed by Biome.

| Guideline Category | Actionable Standard | Rationale |
| :--- | :--- | :--- |
| **Tooling Mandate** | **Biome** is the sole linter/formatter. (`bun run biome check --apply`). | Unified tooling eliminates style conflicts between parallel contributors. |
| **Naming Convention** | **Neo4j Node Labels:** `PascalCase` (`Faction`, `Resource`). **Neo4j Relationship Types:** `UPPER_SNAKE_CASE` (`CONTROLS_RESOURCE`). | Enforces consistency between the database schema, LLM output, and `core-types` interfaces. |
| **TypeScript Config** | `tsconfig.json` must enforce `noImplicitAny: true` and `strict: true`. | Guarantees strong type safety, essential for reliable **Structured Output** from LLMs. |
| **Imports** | Must use Monorepo aliases (`@ace/core-types`) for internal package imports. | Simplifies maintenance and prevents package resolution issues. |

### 1.3. Model Context Protocol (MCP) Implementation

The ACE system exposes its capabilities via the Model Context Protocol (MCP).[6]

| MCP Component | Implementation Detail | Rationale |
| :--- | :--- | :--- |
| **MCP Server** | **`api-gateway`** microservice (Bun HTTP Server). | Bun's high-speed I/O is ideal for a low-latency network interface. |
| **Transport** | **Streamable HTTP** (for production) and **stdio** (for development testing). | Ensures horizontal scalability and maximum client compatibility. |
| **Bounded Context** | The MCP server only exposes tools related to **Lore Generation and Retrieval**. (Avoids exposing ingestion or security tools). | Adheres to MCP best practices, minimizing data exposure and security risk. |
| **Tool Design** | Tools are JSON-schema'd using Zod to ensure clear, discoverable operations for the consuming agent/LLM. | Improves Agent Experience (AX) by giving the LLM precise instructions on how to use the available tools. [7] |

#### Actionable MCP Tool Example (Exposed via `api-gateway`)

| Tool Name | Endpoint (RPC) | Required Schema (Input/Output) |
| :--- | :--- | :--- |
| `get_faction_context` | `/tools/get_context` | **Input:** `FactionName: string`. **Output:** JSON array of related `Resource` nodes. |
| `create_new_faction` | `/tools/create_lore` | **Input:** `SeedMotivation: string`. **Output:** `core-types/FactionSchema`. |

---

## Section 2: Implementation Epics for Parallel Execution

These Epics are designed to be executed in parallel by independent teams (or by agent clusters targeting separate code paths).

### EPIC 1: Foundational Governance and Infrastructure Setup

**Focus:** IaC, CI/CD Workflow, and defining immutable code/data contracts.
**Boundary:** Shared configurations, package definitions, and `.github/workflows`.

| Story (P1 Priority) | To-Do (Actionable CLI/Code) | Dependencies / Non-Conflicting Status |
| :--- | :--- | :--- |
| **1.1: Initialize Monorepo & Governance** | **CLI:** `bun install`, `bun run biome check --apply`. Define root `package.json` workspaces. | Must be completed first. **Non-Conflicting:** Ensures all subsequent code adheres to one standard. |
| **1.2: Define Core Data Contracts** | Implement all required Zod schemas in `packages/core-types` (`FactionSchema`, `EventSchema`, `ResourceSchema`). | **Non-Conflicting:** Write-once package; only interfaces/types are defined, no executable code. |
| **1.3: Setup Core CI/CD Pipeline** | Implement `ci.yml` (GitHub Actions). Jobs: `lint`, `test-unit`, `build-docker`. Ensure the `lint` job runs Biome first. [8] | **Parallelize:** `lint` and `test-unit` jobs can run concurrently. `build-docker` is dependent on both passing. [9] |
| **1.4: Implement Prompt Versioning** | Create `packages/prompt-library`. Implement API endpoint in `api-gateway` to retrieve prompts by `ID` and `Version`. [4, 5] | **Non-Conflicting:** Dedicated package; only internal services rely on the retrieval logic. |

### EPIC 2: The Data Write Path (Ingestion & Knowledge Graph Core)

**Focus:** Ingestion Engine logic, LLM-driven graph extraction, and Neo4j writing.
**Boundary:** `apps/ingestion-engine`, `packages/neo4j-utilities`.

| Story (P2 Priority) | To-Do (Actionable CLI/Code) | Parallelization/Conflict Mitigation |
| :--- | :--- | :--- |
| **2.1: Neo4j Driver & Utilities** | Implement `packages/neo4j-utilities/Driver.ts` and template methods for Cypher `MERGE` statements. | **Non-Conflicting:** Library is passive; requires only testing against a local Neo4j instance. |
| **2.2: KGC: Extraction Logic** | Implement LLM prompting logic in `ingestion-engine` to extract `(Entity)-->(Entity)` triplets from raw text. [10, 11] | **Parallelize:** Use **Bun Workers** to process large batches of documents concurrently. |
| **2.3: KGC: Disambiguation & Write** | Implement entity disambiguation logic (e.g., fuzzy matching and canonicalization) before writing to Neo4j. [11] | **Conflict Mitigation:** **Transactionality**. Use Neo4j transactions and Cypher’s `MERGE` clause to ensure idempotent and non-conflicting concurrent writes to the KG. |
| **2.4: Agent-Augmented Coverage** | Implement the **Coverage Maximizer Agent** (Sub-Agent). Set up Kafka/Message Queue subscription for the `pipeline.quality.fail.coverage` topic. | **Asynchronous Parallelization:** Agent runs independently of the main CD flow. Output is a non-conflicting PR. |

### EPIC 3: The Execution Path (Inference, API, and Validation)

**Focus:** LangGraph orchestration, API endpoints, and the Consistency Checker.
**Boundary:** `apps/api-gateway`, `apps/inference-service`, `apps/evaluation-service`.

| Story (P3 Priority) | To-Do (Actionable CLI/Code) | Parallelization/Conflict Mitigation |
| :--- | :--- | :--- |
| **3.1: LangGraph FSM Setup** | Define the core state machine in `inference-service`. Nodes: `HistorianAgent`, `NarratorAgent`, `ConsistencyCheckerAgent`. [12, 13] | **Parallelize:** Inference service instances are horizontally scalable (K8s). |
| **3.2: Historian Agent Implementation** | Implement `HistorianAgent` to convert user input to Cypher query, execute via `neo4j-utilities`, and return structured GraphRAG context. [14, 15] | **Non-Conflicting:** Read-only operation against the Neo4j KG. |
| **3.3: Narrator Agent & Structured Output** | Implement `NarratorAgent` using LangChain's structured output enforcement, referencing `core-types/FactionSchema.ts`. | **Conflict Mitigation:** **AEC**. The agent’s output is structurally guaranteed to match the central contract, preventing runtime schema errors. |
| **3.4: Consistency Checker Agent** | Implement agent to validate: 1. `Zod.parse()` (structural integrity). 2. LLM self-reflection (factual contradiction check using retrieved context). [3] | **Non-Conflicting:** Validation logic. **Critical Edge:** If validation fails, route the LangGraph flow back to `NarratorAgent` for self-correction. [13] |

-----

## Section 4: Testing, Monitoring, and Operational Excellence

### 4.1. Formal Testing Strategy (SDD $\rightarrow$ Golden Dataset)

The testing strategy is built upon the SDD methodology, where the formal specifications are immediately converted into verifiable test artifacts.[16]

| Artifact | Purpose | Responsibility | Frequency |
| :--- | :--- | :--- | :--- |
| **Golden Dataset** | Versioned repository of **inputs** (prompts) and **ground-truth outputs/context** for LLM regression testing. [17, 18] | Evaluation Service / Domain Experts | Required for every CD gate. |
| **LLM Regression Gate** | Mandatory CD step: Runs all core Golden Dataset tests. Must achieve **Faithfulness $\ge 97\%$** to pass. [19] | CI/CD Pipeline (GitHub Actions) | Every merge to `main` branch. |
| **Test Sharding** | Automatically split the full test suite across multiple, temporary **Kubernetes Job Pods** during CI. | CI/CD Orchestrator (K8s Job Runner) | Every CI run. |

### 4.2. Monitoring and Observability Setup

| Metric / Tool | Purpose | Integration Point |
| :--- | :--- | :--- |
| **P95 Latency** | **NFR Verification** ($\le 500ms$). | Prometheus tracks HTTP server metrics from the `api-gateway`. |
| **Distributed Tracing** | Pinpoint bottlenecks across the complex RAG steps (API $\rightarrow$ Neo4j $\rightarrow$ Ollama). | OpenTelemetry (Jaeger backend) instrumentation required in all App services. [11] |
| **Agent Performance Metrics** | Tracks agent efficiency. **KPI:** Agent Topic Consumption Latency (Kafka). | Grafana/Prometheus monitors the centralized Message Queue (Kafka). |
| **Continuous Consistency** | Samples live production responses and runs the **Faithfulness metric** continuously. | Evaluation Service, triggered on a schedule (e.g., every 5 minutes). |

### 4.3. Sub-Agent Monitoring and Non-Conflicting Output

The sub-agents are monitored by their contribution quality, ensuring their parallel activity doesn't introduce conflicting code.

| Sub-Agent Name | Performance Indicator | Output Constraint (Non-Conflicting) |
| :--- | :--- | :--- |
| **Coverage Maximizer** | **KPI:** PR Acceptance Rate (>90%). | **Output:** Generates only new files (tests). Submits a **Git Pull Request (PR)**, never commits directly to `main`. |
| **Performance Refactoring**| **KPI:** Reduction in P95 Latency (measured after PR merge). | **Output:** Submits small, isolated refactoring PRs (e.g., adding a Neo4j index). **Never** modifies core `LangGraph` flow logic. |