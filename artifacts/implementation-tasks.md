# ACE Project - Comprehensive Implementation Task List

**Version**: 1.0.0
**Last Updated**: 2025-11-09
**Project Phase**: Foundation to Production Readiness
**Total Estimated Duration**: 20 weeks (4 phases)

---

## Table of Contents

1. [Task Legend & Format](#task-legend--format)
2. [Phase 1: Foundation (Weeks 1-4)](#phase-1-foundation-weeks-1-4)
3. [Phase 2: RAG Pipeline (Weeks 5-10)](#phase-2-rag-pipeline-weeks-5-10)
4. [Phase 3: QA & Optimization (Weeks 11-16)](#phase-3-qa--optimization-weeks-11-16)
5. [Phase 4: Production Readiness (Weeks 17-20)](#phase-4-production-readiness-weeks-17-20)
6. [Dependency Chain Visualization](#dependency-chain-visualization)
7. [Progress Tracking Dashboard](#progress-tracking-dashboard)
8. [Agent Task Assignment Matrix](#agent-task-assignment-matrix)

---

## Task Legend & Format

### Task ID Format
`P{Phase}.{Epic}.{Story}.{Task}` - Example: `P1.E1.S2.T3`

### Status Values
- `not_started` - Task not begun
- `in_progress` - Currently being worked on
- `blocked` - Waiting on dependencies or external factors
- `completed` - Task finished and verified
- `skipped` - Task determined unnecessary

### Complexity Levels
- `trivial` - <30 min, simple config/copy
- `simple` - 1-4 hours, straightforward implementation
- `moderate` - 1-2 days, requires design decisions
- `complex` - 3-5 days, significant architectural work
- `very_complex` - 1+ weeks, cross-cutting concerns

### Epic Categories
- **EPIC 1 (E1)**: Foundational Governance & Infrastructure
- **EPIC 2 (E2)**: Data Write Path (Ingestion & KGC)
- **EPIC 3 (E3)**: Execution Path (Inference & API)
- **EPIC 4 (E4)**: Testing & Quality Assurance
- **EPIC 5 (E5)**: DevOps & Deployment
- **EPIC 6 (E6)**: Optimization & Performance
- **EPIC 7 (E7)**: Production Hardening

---

## Phase 1: Foundation (Weeks 1-4)

**Objective**: Establish monorepo structure, core schemas, basic infrastructure, and CI/CD V1

### EPIC 1: Foundational Governance & Infrastructure

#### Story 1.1: Monorepo Initialization & Governance

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P1.E1.S1.T1 | Initialize Bun monorepo | Create root `package.json` with workspaces configuration for `apps/*` and `packages/*` | None | trivial | not_started | - `package.json` exists with `workspaces: ["apps/*", "packages/*"]`<br>- `bun install` runs successfully<br>- `bun.lockb` file generated |
| P1.E1.S1.T2 | Configure Biome linter/formatter | Create `biome.json` with project standards (single quotes, semicolons, max line 100) | P1.E1.S1.T1 | simple | not_started | - `biome.json` exists at root<br>- `bun run biome check --apply` runs on all files<br>- Max line length 100, single quotes enforced |
| P1.E1.S1.T3 | Setup strict TypeScript config | Create root `tsconfig.json` with `strict: true`, `noImplicitAny: true`, module resolution for monorepo | P1.E1.S1.T1 | simple | not_started | - `tsconfig.json` has `strict: true`<br>- Path aliases configured (`@ace/*`)<br>- `bun run tsc --noEmit` passes |
| P1.E1.S1.T4 | Create directory structure | Establish `apps/`, `packages/`, `.github/`, `artifacts/`, `specs/` folders | P1.E1.S1.T1 | trivial | not_started | - All required directories exist<br>- `.gitkeep` files in empty dirs |
| P1.E1.S1.T5 | Configure git hooks | Setup pre-commit hook to run Biome check | P1.E1.S1.T2 | simple | not_started | - Pre-commit hook runs Biome<br>- Commits fail if Biome errors exist |
| P1.E1.S1.T6 | Document naming conventions | Create `CONTRIBUTING.md` with PascalCase (nodes), UPPER_SNAKE_CASE (relationships), camelCase (variables) standards | P1.E1.S1.T2 | simple | not_started | - `CONTRIBUTING.md` documents all naming conventions<br>- Examples provided for each case |

#### Story 1.2: Core Type Definitions (core-types package)

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P1.E1.S2.T1 | Create core-types package structure | Initialize `packages/core-types/` with `package.json`, `tsconfig.json` | P1.E1.S1.T1 | trivial | not_started | - Package structure exists<br>- Exports configured in package.json |
| P1.E1.S2.T2 | Implement FactionSchema (Zod) | Define Zod schema for Faction entity with id, name, alignment, core_motivation, leader_name, controlled_resources, relationship_to_hegemony, justification fields | P1.E1.S2.T1 | moderate | not_started | - `FactionSchema.ts` exports Zod schema<br>- All fields properly typed and described<br>- TypeScript type inferred from schema<br>- Schema validates sample data |
| P1.E1.S2.T3 | Implement EventSchema (Zod) | Define Zod schema for historical events with id, name, date, participants, consequences, source_perspective fields | P1.E1.S2.T1 | moderate | not_started | - `EventSchema.ts` exports Zod schema<br>- Supports viewpoint duality (source tracking)<br>- Validates sample events |
| P1.E1.S2.T4 | Implement ResourceSchema (Zod) | Define Zod schema for resources with id, name, type, location, controlling_faction, strategic_value | P1.E1.S2.T1 | moderate | not_started | - `ResourceSchema.ts` exports Zod schema<br>- All resource types enumerated<br>- Validates sample resources |
| P1.E1.S2.T5 | Implement CharacterSchema (Zod) | Define Zod schema for characters with id, name, faction_affiliation, role, relationships, historical_events | P1.E1.S2.T1 | moderate | not_started | - `CharacterSchema.ts` exports Zod schema<br>- Relationship tracking supported<br>- Validates sample characters |
| P1.E1.S2.T6 | Implement LocationSchema (Zod) | Define Zod schema for locations with id, name, type, climate, connected_locations, controlling_faction, resources | P1.E1.S2.T1 | moderate | not_started | - `LocationSchema.ts` exports Zod schema<br>- Spatial connectivity supported<br>- Validates sample locations |
| P1.E1.S2.T7 | Create shared enums | Define enums for Alignment, ResourceType, LocationType, EventType, RelationshipType | P1.E1.S2.T1 | simple | not_started | - All enums exported from single file<br>- Used consistently across schemas |
| P1.E1.S2.T8 | Create KG relationship types | Define TypeScript types for Neo4j relationships: CONTROLS_RESOURCE, IS_ALLY_OF, PARTICIPATED_IN, LOCATED_IN, etc. | P1.E1.S2.T7 | moderate | not_started | - All relationship types defined<br>- Documented with directionality<br>- Naming follows UPPER_SNAKE_CASE |
| P1.E1.S2.T9 | Create index export file | Create barrel export `index.ts` to export all schemas and types | P1.E1.S2.T2, P1.E1.S2.T3, P1.E1.S2.T4, P1.E1.S2.T5, P1.E1.S2.T6, P1.E1.S2.T7, P1.E1.S2.T8 | trivial | not_started | - Single import path works: `import { FactionSchema } from '@ace/core-types'`<br>- All types accessible |

#### Story 1.3: Prompt Library Package

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P1.E1.S3.T1 | Create prompt-library package structure | Initialize `packages/prompt-library/` with version control structure | P1.E1.S1.T1 | trivial | not_started | - Package structure exists<br>- Subdirectories for agents created |
| P1.E1.S3.T2 | Define prompt versioning schema | Create schema for prompt metadata (version, agent_role, timestamp, hash) | P1.E1.S2.T1 | simple | not_started | - Metadata schema defined<br>- Version format documented (semver) |
| P1.E1.S3.T3 | Create Historian Agent prompts V1 | Write initial prompt templates for GraphRAG retrieval with context assembly | P1.E1.S3.T2 | moderate | not_started | - `historian-v1.0.0.txt` exists<br>- Includes Cypher query generation instructions<br>- Context assembly guidelines documented |
| P1.E1.S3.T4 | Create Narrator Agent prompts V1 | Write initial prompt for lore generation with JSON Schema enforcement | P1.E1.S3.T2 | moderate | not_started | - `narrator-v1.0.0.txt` exists<br>- Includes structured output instructions<br>- Few-shot examples embedded |
| P1.E1.S3.T5 | Create Consistency Checker prompts V1 | Write validation prompt for factual contradiction checking | P1.E1.S3.T2 | moderate | not_started | - `consistency-checker-v1.0.0.txt` exists<br>- Multi-hop reasoning instructions<br>- Self-reflection guidelines |
| P1.E1.S3.T6 | Create KGC extraction prompts V1 | Write prompts for Extract-Define-Canonicalize workflow | P1.E1.S3.T2 | moderate | not_started | - `extraction-v1.0.0.txt` exists<br>- Entity and relationship extraction patterns<br>- Disambiguation instructions |
| P1.E1.S3.T7 | Implement prompt loader utility | Create TypeScript utility to load prompts by version and role | P1.E1.S3.T1, P1.E1.S3.T2 | moderate | not_started | - `PromptLoader.ts` class/function exists<br>- Loads by version ID<br>- Throws error for missing prompts<br>- Unit tests pass |
| P1.E1.S3.T8 | Create prompt metadata tracking | Implement system to link prompt versions to generated content | P1.E1.S3.T2, P1.E1.S3.T7 | moderate | not_started | - Metadata structure defined<br>- Example integration documented<br>- Traceability demonstrated |

#### Story 1.4: Infrastructure as Code Foundation

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P1.E1.S4.T1 | Setup Terraform Cloud workspace | Create TFC workspace with remote state management and locking | None | simple | not_started | - TFC workspace created<br>- Remote state configured<br>- State locking verified |
| P1.E1.S4.T2 | Create IaC repository structure | Setup modular Terraform structure: `modules/network`, `modules/compute`, `modules/database` | P1.E1.S4.T1 | simple | not_started | - Directory structure created<br>- Module organization documented<br>- GitOps workflow defined |
| P1.E1.S4.T3 | Implement network foundation module | Create VPC, subnets, security groups for ACE infrastructure | P1.E1.S4.T2 | complex | not_started | - VPC module exists<br>- Outputs defined for consumption<br>- `terraform plan` succeeds<br>- Policy-as-Code validation passes |
| P1.E1.S4.T4 | Implement K8s cluster module | Create EKS/GKE cluster configuration for microservices | P1.E1.S4.T3 | complex | not_started | - K8s cluster module exists<br>- Node groups configured<br>- Autoscaling enabled<br>- Cluster accessible via kubectl |
| P1.E1.S4.T5 | Implement Redis cluster module | Create managed Redis cluster for distributed locking | P1.E1.S4.T3 | moderate | not_started | - Redis cluster module exists<br>- High availability configured<br>- Connection endpoint exported |
| P1.E1.S4.T6 | Implement Policy-as-Code integration | Setup Sentinel/OPA policies for security validation | P1.E1.S4.T1 | moderate | not_started | - PaC policies defined<br>- Integrated into TFC runs<br>- Policy violations block deployment |
| P1.E1.S4.T7 | Create monitoring infrastructure | Deploy Prometheus, Grafana, OpenTelemetry collectors | P1.E1.S4.T4 | complex | not_started | - Monitoring stack deployed to K8s<br>- Basic dashboards configured<br>- Metrics collection verified |

### EPIC 5: DevOps & Deployment (CI/CD V1)

#### Story 5.1: GitHub Actions CI Pipeline

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P1.E5.S1.T1 | Create base CI workflow file | Initialize `.github/workflows/ci.yml` with job structure | P1.E1.S1.T1 | simple | not_started | - `ci.yml` exists<br>- Triggers on PR and push to main<br>- Bun setup action configured |
| P1.E5.S1.T2 | Implement lint job | Create parallel job for Biome linting across monorepo | P1.E5.S1.T1, P1.E1.S1.T2 | simple | not_started | - Lint job runs in parallel<br>- Fails on Biome errors<br>- Caches dependencies |
| P1.E5.S1.T3 | Implement type-check job | Create parallel job for TypeScript compilation | P1.E5.S1.T1, P1.E1.S1.T3 | simple | not_started | - Type-check job runs in parallel<br>- Fails on TS errors<br>- Uses tsc --noEmit |
| P1.E5.S1.T4 | Implement unit test job | Create job for running Bun test runner with coverage | P1.E5.S1.T1 | moderate | not_started | - Test job runs after lint/type-check<br>- Coverage threshold enforced (85%)<br>- Coverage report artifact uploaded |
| P1.E5.S1.T5 | Implement build job | Create job to build all microservices | P1.E5.S1.T4 | moderate | not_started | - Build job runs after tests pass<br>- All apps build successfully<br>- Build artifacts cached |
| P1.E5.S1.T6 | Setup GitHub Secrets | Configure secrets for Docker registry, K8s access | None | trivial | not_started | - Secrets documented<br>- Access verified<br>- No secrets in code |
| P1.E5.S1.T7 | Implement dependency caching | Add Bun dependency caching to workflow | P1.E5.S1.T1 | simple | not_started | - Dependencies cached<br>- CI runs faster on cache hit<br>- Cache invalidation works |

#### Story 5.2: Docker Containerization

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P1.E5.S2.T1 | Create api-gateway Dockerfile | Multi-stage Dockerfile for Bun API Gateway | P1.E1.S1.T1 | moderate | not_started | - Dockerfile exists at `apps/api-gateway/Dockerfile`<br>- Uses Bun base image<br>- Optimized layer caching<br>- Image builds successfully |
| P1.E5.S2.T2 | Create inference-service Dockerfile | Multi-stage Dockerfile with GPU/Ollama support | P1.E1.S1.T1 | complex | not_started | - Dockerfile exists<br>- GPU drivers included<br>- Ollama dependencies installed<br>- Image builds successfully |
| P1.E5.S2.T3 | Create ingestion-engine Dockerfile | Dockerfile for async Bun Workers service | P1.E1.S1.T1 | moderate | not_started | - Dockerfile exists<br>- Bun Workers supported<br>- Image builds successfully |
| P1.E5.S2.T4 | Create evaluation-service Dockerfile | Lightweight Dockerfile for testing service | P1.E1.S1.T1 | moderate | not_started | - Dockerfile exists<br>- Testing dependencies included<br>- Image builds successfully |
| P1.E5.S2.T5 | Add docker-build job to CI | Integrate Docker builds into GitHub Actions | P1.E5.S1.T5, P1.E5.S2.T1, P1.E5.S2.T2, P1.E5.S2.T3, P1.E5.S2.T4 | moderate | not_started | - Docker build job runs after code build<br>- All images build in parallel<br>- Images tagged with git SHA |
| P1.E5.S2.T6 | Setup container registry | Configure Docker Hub/GHCR for image storage | None | simple | not_started | - Registry configured<br>- Push access verified<br>- Image retention policy set |
| P1.E5.S2.T7 | Implement docker-push job | Push tagged images to registry on main branch | P1.E5.S2.T5, P1.E5.S2.T6 | simple | not_started | - Push only on main branch<br>- Images tagged correctly<br>- Push succeeds |

#### Story 5.3: Basic Service Scaffolding

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P1.E5.S3.T1 | Scaffold api-gateway app | Create basic Hono/Bun HTTP server with health endpoint | P1.E1.S1.T4 | moderate | not_started | - `apps/api-gateway/index.ts` exists<br>- Server starts on port 3000<br>- GET /health returns 200<br>- Imports work from @ace/core-types |
| P1.E5.S3.T2 | Scaffold inference-service app | Create basic service structure with placeholder routes | P1.E1.S1.T4 | moderate | not_started | - `apps/inference-service/index.ts` exists<br>- Service structure documented<br>- Health endpoint functional |
| P1.E5.S3.T3 | Scaffold ingestion-engine app | Create service with Bun Worker setup | P1.E1.S1.T4 | moderate | not_started | - `apps/ingestion-engine/index.ts` exists<br>- Worker instantiation verified<br>- Health endpoint functional |
| P1.E5.S3.T4 | Scaffold evaluation-service app | Create testing service structure | P1.E1.S1.T4 | moderate | not_started | - `apps/evaluation-service/index.ts` exists<br>- Service structure documented<br>- Ready for test integration |
| P1.E5.S3.T5 | Add basic logging | Implement consistent logging across all services | P1.E5.S3.T1, P1.E5.S3.T2, P1.E5.S3.T3, P1.E5.S3.T4 | simple | not_started | - Logging utility in shared package<br>- Structured JSON logs<br>- Log levels configurable |

---

## Phase 2: RAG Pipeline (Weeks 5-10)

**Objective**: Build ingestion engine, implement GraphRAG, integrate Ollama, establish baseline metrics

### EPIC 2: Data Write Path (Ingestion & KGC)

#### Story 2.1: Neo4j Infrastructure & Utilities

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P2.E2.S1.T1 | Create neo4j-utilities package | Initialize package structure with Neo4j driver | P1.E1.S1.T1 | simple | not_started | - Package exists at `packages/neo4j-utilities`<br>- Dependencies installed (neo4j-driver)<br>- Exports configured |
| P2.E2.S1.T2 | Deploy Neo4j instance (Dev) | Provision Neo4j database via IaC or Docker Compose | P1.E1.S4.T4 | moderate | not_started | - Neo4j instance running<br>- Accessible on standard ports<br>- Credentials configured securely |
| P2.E2.S1.T3 | Implement Neo4j Driver singleton | Create singleton driver instance with connection pooling | P2.E2.S1.T1, P2.E2.S1.T2 | moderate | not_started | - `Driver.ts` exports singleton<br>- Connection pooling configured<br>- Connection retry logic implemented<br>- Unit tests verify connectivity |
| P2.E2.S1.T4 | Define KG ontology/schema | Document node labels, relationship types, property constraints | P1.E1.S2.T8 | complex | not_started | - Schema documented in `docs/kg-schema.md`<br>- All entity types defined<br>- All relationship types defined<br>- Cardinality constraints documented |
| P2.E2.S1.T5 | Create Cypher query templates | Build reusable Cypher templates for MERGE, CREATE, MATCH operations | P2.E2.S1.T4 | moderate | not_started | - Template functions exist<br>- Parameterized queries<br>- Prevent injection attacks<br>- Unit tests verify query generation |
| P2.E2.S1.T6 | Implement entity MERGE operations | Create functions for idempotent entity creation/updates | P2.E2.S1.T5 | moderate | not_started | - MERGE functions for all entity types<br>- Atomic operations<br>- Return created/updated node<br>- Unit tests pass |
| P2.E2.S1.T7 | Implement relationship MERGE operations | Create functions for idempotent relationship creation | P2.E2.S1.T5, P2.E2.S1.T6 | moderate | not_started | - MERGE functions for all relationship types<br>- Directionality correct<br>- Properties supported<br>- Unit tests pass |
| P2.E2.S1.T8 | Implement transaction support | Add transaction wrapper utilities | P2.E2.S1.T3 | moderate | not_started | - Transaction begin/commit/rollback<br>- Error handling<br>- Rollback on failure<br>- Integration tests pass |
| P2.E2.S1.T9 | Create schema validation queries | Implement SPARQL-like validation for KG integrity | P2.E2.S1.T4 | complex | not_started | - Validation queries for each constraint<br>- Automated validation function<br>- Reports violations clearly |

#### Story 2.2: Vector Store Integration

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P2.E2.S2.T1 | Select vector store (Qdrant/Pinecone) | Decision document and setup instructions | None | simple | not_started | - Decision documented with rationale<br>- Setup guide created |
| P2.E2.S2.T2 | Deploy vector store instance (Dev) | Provision Qdrant/Pinecone via IaC or Docker | P2.E2.S2.T1, P1.E1.S4.T4 | moderate | not_started | - Vector store instance running<br>- Accessible via API<br>- Credentials configured |
| P2.E2.S2.T3 | Create vector-utilities package | Initialize package with vector store client | P2.E2.S2.T2 | simple | not_started | - Package structure exists<br>- Client library installed<br>- Exports configured |
| P2.E2.S2.T4 | Implement embedding client | Create wrapper for embedding generation (OpenAI/local model) | P2.E2.S2.T3 | moderate | not_started | - Embedding function exists<br>- Supports batch processing<br>- Rate limiting implemented<br>- Unit tests pass |
| P2.E2.S2.T5 | Implement vector upsert operations | Create functions to insert/update vectors with metadata | P2.E2.S2.T3, P2.E2.S2.T4 | moderate | not_started | - Upsert function exists<br>- Metadata properly attached<br>- Idempotent operations<br>- Integration tests pass |
| P2.E2.S2.T6 | Implement vector search | Create ANN search function with filtering | P2.E2.S2.T5 | moderate | not_started | - Search function exists<br>- Configurable k (top-k results)<br>- Metadata filtering supported<br>- Returns normalized scores |
| P2.E2.S2.T7 | Configure HNSW indexing | Optimize ANN index parameters for performance | P2.E2.S2.T6 | moderate | not_started | - HNSW parameters tuned<br>- Index build verified<br>- Search latency < 50ms (P95) |

#### Story 2.3: Knowledge Graph Construction Pipeline

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P2.E2.S3.T1 | Design EDC workflow architecture | Document Extract-Define-Canonicalize process flow | P2.E2.S1.T4 | moderate | not_started | - Workflow diagram created<br>- Each stage documented<br>- Error handling defined |
| P2.E2.S3.T2 | Implement document ingestion endpoint | Create API endpoint to accept raw text documents | P1.E5.S3.T3 | moderate | not_started | - POST /ingest endpoint exists<br>- Accepts text/PDF<br>- Validates input<br>- Returns job ID |
| P2.E2.S3.T3 | Implement Extract stage (entities) | LLM-based entity extraction from text | P1.E1.S3.T6, P2.E2.S3.T2 | complex | not_started | - Extraction function exists<br>- Uses versioned prompt<br>- Structured JSON output<br>- Handles extraction failures<br>- Unit tests with fixtures |
| P2.E2.S3.T4 | Implement Extract stage (relationships) | LLM-based relationship extraction from text | P2.E2.S3.T3 | complex | not_started | - Relationship extraction function<br>- Identifies source/target entities<br>- Structured JSON output<br>- Integration tests pass |
| P2.E2.S3.T5 | Implement Define stage | Classify extracted data against KG ontology | P2.E2.S3.T4, P2.E2.S1.T4 | complex | not_started | - Classification function exists<br>- Maps to ontology types<br>- Validates against schema<br>- Rejects invalid types |
| P2.E2.S3.T6 | Implement Canonicalize stage | Entity disambiguation and deduplication | P2.E2.S3.T5 | very_complex | not_started | - Disambiguation logic exists<br>- Fuzzy matching implemented<br>- Canonical entity resolution<br>- Prevents duplicate nodes<br>- Integration tests verify deduplication |
| P2.E2.S3.T7 | Implement KG write operations | Write validated entities/relationships to Neo4j | P2.E2.S3.T6, P2.E2.S1.T6, P2.E2.S1.T7 | moderate | not_started | - Write function exists<br>- Uses transactions<br>- Rollback on failure<br>- Integration tests verify writes |
| P2.E2.S3.T8 | Implement Bun Workers parallelization | Distribute extraction across worker threads | P2.E2.S3.T3, P2.E2.S3.T4 | complex | not_started | - Worker pool configured<br>- Work distribution implemented<br>- Results aggregated correctly<br>- Handles worker failures |
| P2.E2.S3.T9 | Add vector embedding generation | Generate and store embeddings during ingestion | P2.E2.S2.T4, P2.E2.S3.T7 | moderate | not_started | - Embeddings generated for entities<br>- Stored in vector DB<br>- Metadata links to Neo4j IDs<br>- Integration tests pass |
| P2.E2.S3.T10 | Implement ingestion job queue | Add queue for async processing (Kafka/Redis) | P2.E2.S3.T2 | complex | not_started | - Job queue operational<br>- Workers consume from queue<br>- Job status tracking<br>- Retry logic on failures |

### EPIC 3: Execution Path (Inference & API)

#### Story 3.1: Ollama Integration

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P2.E3.S1.T1 | Deploy Ollama instance (Dev) | Setup Ollama server with initial model | P1.E1.S4.T4 | moderate | not_started | - Ollama running in K8s/Docker<br>- GPU access configured (if available)<br>- Model downloaded (Llama/Mistral) |
| P2.E3.S1.T2 | Create Ollama client package | Build TypeScript client for Ollama REST API | P2.E3.S1.T1 | moderate | not_started | - Client package exists<br>- Supports streaming responses<br>- Timeout handling<br>- Unit tests with mocked API |
| P2.E3.S1.T3 | Implement model quantization | Apply 4-bit/8-bit quantization to models | P2.E3.S1.T1 | complex | not_started | - Quantized model loaded in Ollama<br>- Quality degradation measured<br>- Inference speed improvement verified<br>- VRAM reduction documented |
| P2.E3.S1.T4 | Implement structured output support | Configure JSON Schema enforcement in Ollama calls | P2.E3.S1.T2, P1.E1.S2.T2 | moderate | not_started | - JSON Schema passed to Ollama<br>- Output validated against schema<br>- Retry on invalid JSON<br>- Integration tests pass |
| P2.E3.S1.T5 | Add prompt template support | Integrate prompt-library with Ollama client | P2.E3.S1.T2, P1.E1.S3.T7 | simple | not_started | - Prompts loaded by version<br>- Variables interpolated correctly<br>- Metadata tracked in logs |
| P2.E3.S1.T6 | Implement inference metrics | Track tokens/sec, latency, token count | P2.E3.S1.T2 | moderate | not_started | - Metrics collected per request<br>- Exported to Prometheus<br>- Dashboard shows inference stats |

#### Story 3.2: LangGraph FSM Implementation

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P2.E3.S2.T1 | Install LangGraph dependencies | Add LangGraph, LangChain to inference-service | P1.E5.S3.T2 | trivial | not_started | - Dependencies installed<br>- LangGraph imports work<br>- TypeScript types available |
| P2.E3.S2.T2 | Define FSM state schema | Create TypeScript interface for workflow state | P2.E3.S2.T1, P1.E1.S2.T1 | moderate | not_started | - State interface defined<br>- All agent inputs/outputs typed<br>- State transitions documented |
| P2.E3.S2.T3 | Implement Request Processor node | Create user input translation agent | P2.E3.S2.T2 | moderate | not_started | - Node implementation exists<br>- Converts user text to structured state<br>- Validates input format<br>- Unit tests pass |
| P2.E3.S2.T4 | Implement Historian Agent node | Create GraphRAG retrieval agent | P2.E3.S2.T2, P2.E2.S1.T5, P2.E2.S2.T6, P1.E1.S3.T3 | complex | not_started | - Node implementation exists<br>- Generates Cypher queries<br>- Executes graph search<br>- Performs vector search<br>- Combines results<br>- Returns structured context |
| P2.E3.S2.T5 | Implement Narrator Agent node | Create lore generation agent with structured output | P2.E3.S2.T2, P2.E3.S1.T4, P1.E1.S3.T4 | complex | not_started | - Node implementation exists<br>- Generates lore from context<br>- Enforces JSON Schema output<br>- Uses Narrative-of-Thought prompting<br>- Integration tests pass |
| P2.E3.S2.T6 | Implement Consistency Checker node | Create validation agent | P2.E3.S2.T2, P1.E1.S3.T5 | complex | not_started | - Node implementation exists<br>- Validates against Zod schema<br>- Checks factual contradictions<br>- Multi-hop reasoning implemented<br>- Returns PASS/FAIL with reasons |
| P2.E3.S2.T7 | Implement Human Review node | Create HITL checkpoint agent | P2.E3.S2.T2 | moderate | not_started | - Node implementation exists<br>- Pauses workflow execution<br>- Exposes review interface<br>- Resumes from same state<br>- Integration tests verify pause/resume |
| P2.E3.S2.T8 | Define conditional edges | Create routing logic between nodes | P2.E3.S2.T3, P2.E3.S2.T4, P2.E3.S2.T5, P2.E3.S2.T6, P2.E3.S2.T7 | moderate | not_started | - Edges defined in graph<br>- Conditional logic based on validation<br>- Loop-back on failure<br>- Max retry limit enforced |
| P2.E3.S2.T9 | Implement LangGraph workflow | Assemble complete FSM with all nodes and edges | P2.E3.S2.T8 | moderate | not_started | - Workflow graph compiled<br>- End-to-end execution works<br>- State persists between nodes<br>- Integration tests cover full flow |
| P2.E3.S2.T10 | Add LangSmith integration | Enable observability for workflow debugging | P2.E3.S2.T9 | simple | not_started | - LangSmith configured<br>- Traces visible in dashboard<br>- Errors tracked with context |

#### Story 3.3: MCP Server Implementation

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P2.E3.S3.T1 | Design MCP tool schema | Define JSON schemas for all exposed tools | P1.E1.S2.T1 | moderate | not_started | - All tools documented<br>- Input/output schemas defined<br>- Tool discovery supported |
| P2.E3.S3.T2 | Implement get_faction_context tool | Create tool to retrieve faction-related entities | P2.E3.S3.T1, P2.E2.S1.T5 | moderate | not_started | - Tool function exists<br>- Executes Cypher query<br>- Returns JSON array<br>- Validates inputs with Zod |
| P2.E3.S3.T3 | Implement create_new_faction tool | Create tool to trigger lore generation workflow | P2.E3.S3.T1, P2.E3.S2.T9 | moderate | not_started | - Tool function exists<br>- Invokes LangGraph workflow<br>- Returns generated faction<br>- Error handling complete |
| P2.E3.S3.T4 | Implement MCP server endpoints | Expose tools via HTTP/stdio transport | P1.E5.S3.T1, P2.E3.S3.T2, P2.E3.S3.T3 | complex | not_started | - POST /tools/{tool_name} endpoints<br>- stdio mode for CLI testing<br>- Authentication implemented<br>- Rate limiting configured |
| P2.E3.S3.T5 | Add MCP server documentation | Document tool usage for consuming agents | P2.E3.S3.T4 | simple | not_started | - OpenAPI/JSON-RPC spec generated<br>- Example requests provided<br>- Error codes documented |
| P2.E3.S3.T6 | Implement tool validation | Validate tool inputs against schemas | P2.E3.S3.T1, P2.E3.S3.T4 | moderate | not_started | - All inputs validated with Zod<br>- Clear error messages<br>- Invalid requests rejected (400) |

#### Story 3.4: Hybrid RAG Implementation

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P2.E3.S4.T1 | Design hybrid retrieval strategy | Document when to use graph vs vector search | P2.E2.S1.T4 | moderate | not_started | - Strategy documented<br>- Decision tree created<br>- Performance trade-offs analyzed |
| P2.E3.S4.T2 | Implement query classification | Classify queries as graph-first or vector-first | P2.E3.S4.T1 | moderate | not_started | - Classification function exists<br>- Heuristics or ML-based<br>- Unit tests cover edge cases |
| P2.E3.S4.T3 | Implement graph retrieval path | Execute graph queries via Neo4j | P2.E3.S4.T2, P2.E2.S1.T5 | moderate | not_started | - Cypher query generation<br>- Multi-hop traversal supported<br>- Result formatting to context |
| P2.E3.S4.T4 | Implement vector retrieval path | Execute vector similarity search | P2.E3.S4.T2, P2.E2.S2.T6 | moderate | not_started | - Embedding generation<br>- ANN search execution<br>- Result formatting to context |
| P2.E3.S4.T5 | Implement result fusion | Combine graph and vector results | P2.E3.S4.T3, P2.E3.S4.T4 | complex | not_started | - Fusion algorithm implemented<br>- Deduplication logic<br>- Ranking/scoring strategy<br>- Context assembly |
| P2.E3.S4.T6 | Implement context assembly | Format retrieved data for LLM consumption | P2.E3.S4.T5 | moderate | not_started | - Context template created<br>- Token limit enforcement<br>- Prioritization of results<br>- Metadata preserved |
| P2.E3.S4.T7 | Add retrieval caching | Cache frequent queries to reduce latency | P2.E3.S4.T5 | moderate | not_started | - Redis cache integration<br>- TTL configuration<br>- Cache invalidation strategy<br>- Cache hit metrics |

### EPIC 5: DevOps & Deployment (Baseline Metrics)

#### Story 5.4: Performance Baseline Establishment

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P2.E5.S4.T1 | Setup load testing framework | Install and configure k6 or Artillery | P2.E3.S3.T4 | simple | not_started | - Load testing tool installed<br>- Sample test scripts created<br>- Runs against Dev environment |
| P2.E5.S4.T2 | Create baseline test scenarios | Define user journeys for load testing | P2.E5.S4.T1 | moderate | not_started | - 5+ realistic scenarios defined<br>- VU (virtual users) configured<br>- Request patterns documented |
| P2.E5.S4.T3 | Execute baseline latency tests | Measure P50, P95, P99 latency | P2.E5.S4.T2, P2.E3.S2.T9 | moderate | not_started | - Tests executed on Dev<br>- Latency metrics collected<br>- Documented in baseline report |
| P2.E5.S4.T4 | Execute baseline throughput tests | Measure sustained RPS capacity | P2.E5.S4.T2 | moderate | not_started | - Throughput tests executed<br>- Max RPS documented<br>- Bottlenecks identified |
| P2.E5.S4.T5 | Measure token consumption | Track token usage per query type | P2.E3.S1.T6 | simple | not_started | - Token metrics collected<br>- Cost per query calculated<br>- Documented in baseline report |
| P2.E5.S4.T6 | Document performance baseline | Create baseline report with all metrics | P2.E5.S4.T3, P2.E5.S4.T4, P2.E5.S4.T5 | simple | not_started | - Baseline report document exists<br>- All NFRs measured<br>- Gaps from targets identified |

---

## Phase 3: QA & Optimization (Weeks 11-16)

**Objective**: Build evaluation service, create golden dataset, optimize prompts and models, verify NFRs

### EPIC 4: Testing & Quality Assurance

#### Story 4.1: Evaluation Microservice

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P3.E4.S1.T1 | Design evaluation architecture | Document evaluation service responsibilities | P1.E5.S3.T4 | moderate | not_started | - Architecture documented<br>- Interfaces defined<br>- Metrics catalog created |
| P3.E4.S1.T2 | Implement Faithfulness metric | LLM-as-a-judge for context grounding | P3.E4.S1.T1, P2.E3.S1.T2 | complex | not_started | - Faithfulness function exists<br>- Uses judge LLM<br>- Compares output to context<br>- Returns score 0-100%<br>- Unit tests with examples |
| P3.E4.S1.T3 | Implement Evidence Coverage metric | Measure completeness of answers | P3.E4.S1.T1 | complex | not_started | - Coverage function exists<br>- Identifies covered knowledge points<br>- Returns score 0-100%<br>- Unit tests pass |
| P3.E4.S1.T4 | Implement Answer Accuracy metric | Semantic similarity + factual consistency | P3.E4.S1.T1 | complex | not_started | - Accuracy function exists<br>- Compares to reference answer<br>- Combines similarity & consistency<br>- Returns score 0-100% |
| P3.E4.S1.T5 | Implement Recall@k metric | Retrieval quality measurement | P3.E4.S1.T1 | moderate | not_started | - Recall function exists<br>- Configurable k values<br>- Checks ground truth presence<br>- Unit tests pass |
| P3.E4.S1.T6 | Create evaluation API endpoints | Expose metrics via REST API | P3.E4.S1.T2, P3.E4.S1.T3, P3.E4.S1.T4, P3.E4.S1.T5 | moderate | not_started | - POST /evaluate/faithfulness endpoint<br>- POST /evaluate/coverage endpoint<br>- POST /evaluate/accuracy endpoint<br>- POST /evaluate/recall endpoint<br>- Input validation with Zod |
| P3.E4.S1.T7 | Implement batch evaluation | Support evaluating multiple test cases | P3.E4.S1.T6 | moderate | not_started | - Batch endpoint exists<br>- Parallel evaluation supported<br>- Progress tracking<br>- Results aggregated |
| P3.E4.S1.T8 | Add evaluation report generation | Generate comprehensive test reports | P3.E4.S1.T7 | moderate | not_started | - Report generation function<br>- HTML/JSON output formats<br>- Charts and visualizations<br>- Pass/fail summary |

#### Story 4.2: Golden Dataset Creation

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P3.E4.S2.T1 | Define golden dataset schema | Create structure for test cases | P1.E1.S2.T1 | moderate | not_started | - Schema document exists<br>- Input/output format defined<br>- Metadata fields specified<br>- Zod schema created |
| P3.E4.S2.T2 | Create common scenario test cases | 20+ typical user queries | P3.E4.S2.T1 | complex | not_started | - 20+ test cases created<br>- Inputs documented<br>- Expected outputs defined<br>- Context requirements noted |
| P3.E4.S2.T3 | Create edge case test cases | 15+ boundary/edge scenarios | P3.E4.S2.T1 | complex | not_started | - 15+ edge cases created<br>- Long inputs tested<br>- Missing data scenarios<br>- Ambiguous queries included |
| P3.E4.S2.T4 | Create adversarial test cases | 15+ adversarial/attack scenarios | P3.E4.S2.T1 | complex | not_started | - 15+ adversarial cases created<br>- Prompt injection attempts<br>- Contradiction scenarios<br>- Hallucination triggers |
| P3.E4.S2.T5 | Implement dataset versioning | Version control for golden dataset | P3.E4.S2.T2, P3.E4.S2.T3, P3.E4.S2.T4 | simple | not_started | - Dataset in Git with versioning<br>- Changelog maintained<br>- Tagged releases |
| P3.E4.S2.T6 | Create dataset loader utility | Load test cases programmatically | P3.E4.S2.T5 | simple | not_started | - Loader function exists<br>- Filters by category/version<br>- Validates schema<br>- Unit tests pass |
| P3.E4.S2.T7 | Expert validation of dataset | Domain expert review and approval | P3.E4.S2.T2, P3.E4.S2.T3, P3.E4.S2.T4 | moderate | not_started | - All cases reviewed<br>- Expert approval documented<br>- Corrections applied |

#### Story 4.3: LLM Regression Testing

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P3.E4.S3.T1 | Implement regression test runner | Execute golden dataset against inference service | P3.E4.S2.T6, P3.E4.S1.T7 | complex | not_started | - Test runner exists<br>- Iterates through dataset<br>- Calls inference service<br>- Collects results |
| P3.E4.S3.T2 | Implement test result aggregation | Aggregate metrics across all test cases | P3.E4.S3.T1 | moderate | not_started | - Aggregation function exists<br>- Average scores calculated<br>- Pass/fail threshold applied<br>- Results formatted |
| P3.E4.S3.T3 | Add regression test to CI | Integrate as mandatory gate in GitHub Actions | P3.E4.S3.T2, P1.E5.S1.T5 | moderate | not_started | - CI job added<br>- Runs on main branch merges<br>- Fails if Faithfulness < 97%<br>- Report uploaded as artifact |
| P3.E4.S3.T4 | Create regression test dashboard | Visualize regression test trends over time | P3.E4.S3.T2 | moderate | not_started | - Grafana dashboard exists<br>- Shows Faithfulness trend<br>- Highlights regressions<br>- Tracks token cost |
| P3.E4.S3.T5 | Implement test result comparison | Compare results between runs/versions | P3.E4.S3.T2 | moderate | not_started | - Comparison function exists<br>- Highlights differences<br>- Identifies regressions<br>- Report generation |

#### Story 4.4: Unit & Integration Testing

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P3.E4.S4.T1 | Write core-types unit tests | Test all Zod schemas | P1.E1.S2.T9 | moderate | not_started | - All schemas have tests<br>- Valid/invalid cases covered<br>- 100% coverage |
| P3.E4.S4.T2 | Write neo4j-utilities unit tests | Test query generation, connections | P2.E2.S1.T9 | moderate | not_started | - All functions tested<br>- Mocked Neo4j driver<br>- Edge cases covered<br>- 90%+ coverage |
| P3.E4.S4.T3 | Write vector-utilities unit tests | Test embedding, search functions | P2.E2.S2.T7 | moderate | not_started | - All functions tested<br>- Mocked vector client<br>- 90%+ coverage |
| P3.E4.S4.T4 | Write api-gateway integration tests | Test MCP endpoints end-to-end | P2.E3.S3.T4 | complex | not_started | - All endpoints tested<br>- Auth scenarios covered<br>- Error cases tested<br>- 85%+ coverage |
| P3.E4.S4.T5 | Write inference-service integration tests | Test LangGraph workflow | P2.E3.S2.T9 | complex | not_started | - Complete workflows tested<br>- Mocked external services<br>- State persistence verified<br>- 85%+ coverage |
| P3.E4.S4.T6 | Write ingestion-engine integration tests | Test KGC pipeline | P2.E2.S3.T10 | complex | not_started | - Full pipeline tested<br>- Worker parallelism verified<br>- Error handling tested<br>- 85%+ coverage |
| P3.E4.S4.T7 | Setup test data fixtures | Create reusable test data | P3.E4.S4.T1 | moderate | not_started | - Fixture library exists<br>- Covers all entity types<br>- Realistic data<br>- Easy to import |
| P3.E4.S4.T8 | Implement test sharding | Parallelize test execution in CI | P3.E4.S4.T4, P3.E4.S4.T5, P3.E4.S4.T6 | moderate | not_started | - Tests sharded by service<br>- Parallel execution in CI<br>- Results aggregated<br>- CI time reduced |

### EPIC 6: Optimization & Performance

#### Story 6.1: Prompt Optimization

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P3.E6.S1.T1 | Analyze prompt performance | Measure quality vs token count for all prompts | P2.E5.S4.T5, P3.E4.S1.T8 | moderate | not_started | - Analysis report exists<br>- Each prompt evaluated<br>- Token/quality metrics documented |
| P3.E6.S1.T2 | Implement Chain-of-Thought prompting | Add CoT reasoning to critical prompts | P3.E6.S1.T1, P1.E1.S3.T4, P1.E1.S3.T5 | moderate | not_started | - CoT versions created<br>- Reasoning steps documented<br>- Quality improvement verified |
| P3.E6.S1.T3 | Add few-shot examples | Enhance prompts with demonstration examples | P3.E6.S1.T1, P3.E4.S2.T7 | moderate | not_started | - Examples added to prompts<br>- Diverse scenarios covered<br>- Quality improvement measured |
| P3.E6.S1.T4 | Optimize token usage | Reduce prompt lengths without quality loss | P3.E6.S1.T1 | moderate | not_started | - Prompts shortened<br>- Token count reduced by 20%+<br>- Quality maintained (Faithfulness ≥ 97%) |
| P3.E6.S1.T5 | A/B test prompt variations | Compare multiple prompt versions | P3.E6.S1.T2, P3.E6.S1.T3, P3.E6.S1.T4 | complex | not_started | - A/B test framework exists<br>- Multiple versions tested<br>- Winner selected by metrics<br>- Results documented |
| P3.E6.S1.T6 | Version and deploy optimized prompts | Update prompt library with winners | P3.E6.S1.T5, P1.E1.S3.T8 | simple | not_started | - New versions committed<br>- Version metadata updated<br>- Deployed to services |

#### Story 6.2: Model Optimization

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P3.E6.S2.T1 | Benchmark model candidates | Test multiple open-weight models | P2.E3.S1.T1 | complex | not_started | - 3+ models tested<br>- Latency measured<br>- Quality measured<br>- VRAM usage documented |
| P3.E6.S2.T2 | Fine-tune quantization parameters | Optimize 4-bit/8-bit settings | P2.E3.S1.T3, P3.E6.S2.T1 | complex | not_started | - Quantization levels tested<br>- Quality degradation measured<br>- Optimal config selected<br>- VRAM reduction documented |
| P3.E6.S2.T3 | Implement model pruning | Remove unnecessary model weights | P3.E6.S2.T1 | very_complex | not_started | - Pruning applied to selected model<br>- Quality impact measured<br>- Speed improvement verified<br>- Model size reduced |
| P3.E6.S2.T4 | Optimize embedding model | Select and optimize separate embedding model | P2.E2.S2.T4 | moderate | not_started | - Embedding model selected<br>- Quantized if applicable<br>- Embedding latency < 10ms<br>- Quality maintained |
| P3.E6.S2.T5 | Configure model caching | Implement KV cache optimization | P2.E3.S1.T1 | moderate | not_started | - KV caching enabled<br>- Cache hit rate measured<br>- Latency improvement verified |

#### Story 6.3: Retrieval Optimization

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P3.E6.S3.T1 | Optimize Cypher queries | Add indexes and query hints to Neo4j | P2.E2.S1.T5, P2.E5.S4.T3 | complex | not_started | - Slow queries identified<br>- Indexes created<br>- Query hints added<br>- Query latency reduced by 30%+ |
| P3.E6.S3.T2 | Tune HNSW parameters | Optimize vector index for speed/accuracy trade-off | P2.E2.S2.T7, P2.E5.S4.T3 | moderate | not_started | - HNSW params tuned<br>- Search latency < 30ms (P95)<br>- Recall@10 > 95% |
| P3.E6.S3.T3 | Implement query result caching | Cache frequent retrieval results | P2.E3.S4.T7 | moderate | not_started | - Caching expanded<br>- Cache hit rate > 40%<br>- Cached latency < 10ms |
| P3.E6.S3.T4 | Optimize context assembly | Reduce token count in retrieved context | P2.E3.S4.T6 | moderate | not_started | - Context truncation logic<br>- Prioritization by relevance<br>- Token usage reduced by 25%<br>- Quality maintained |
| P3.E6.S3.T5 | Implement query batching | Batch multiple queries to reduce round trips | P2.E2.S1.T3, P2.E2.S2.T3 | moderate | not_started | - Batching logic implemented<br>- Latency improvement measured<br>- Throughput increased |

#### Story 6.4: Performance Verification

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P3.E6.S4.T1 | Execute optimized latency tests | Re-measure P95 latency after optimizations | P3.E6.S1.T6, P3.E6.S2.T5, P3.E6.S3.T5 | moderate | not_started | - Tests executed<br>- P95 latency documented<br>- Comparison to baseline |
| P3.E6.S4.T2 | Execute optimized throughput tests | Re-measure sustained RPS | P3.E6.S1.T6, P3.E6.S2.T5, P3.E6.S3.T5 | moderate | not_started | - Tests executed<br>- Max RPS documented<br>- Comparison to baseline |
| P3.E6.S4.T3 | Verify Faithfulness NFR | Ensure Faithfulness ≥ 97% after optimizations | P3.E6.S1.T6, P3.E4.S3.T1 | moderate | not_started | - Regression tests executed<br>- Faithfulness score ≥ 97%<br>- No quality regression |
| P3.E6.S4.T4 | Verify token cost reduction | Measure token usage improvement | P3.E6.S1.T4, P3.E6.S3.T4 | simple | not_started | - Token metrics collected<br>- Cost reduction calculated<br>- Documented in report |
| P3.E6.S4.T5 | Create optimization report | Document all improvements and gaps | P3.E6.S4.T1, P3.E6.S4.T2, P3.E6.S4.T3, P3.E6.S4.T4 | moderate | not_started | - Report document exists<br>- All metrics vs NFRs<br>- Remaining gaps identified<br>- Recommendations provided |

---

## Phase 4: Production Readiness (Weeks 17-20)

**Objective**: Deploy staging environment, implement zero-downtime deployment, verify all NFRs, prepare for production launch

### EPIC 7: Production Hardening

#### Story 7.1: Staging Environment Deployment

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P4.E7.S1.T1 | Provision staging infrastructure | Deploy production-parity infrastructure via IaC | P1.E1.S4.T7 | complex | not_started | - All IaC modules deployed to Staging<br>- K8s cluster operational<br>- Neo4j cluster configured<br>- Vector store deployed |
| P4.E7.S1.T2 | Deploy Neo4j cluster (Staging) | Configure HA Neo4j with clustering | P4.E7.S1.T1 | complex | not_started | - 3+ node cluster running<br>- Causal clustering configured<br>- Failover tested<br>- Backup/restore verified |
| P4.E7.S1.T3 | Deploy vector store cluster (Staging) | Configure HA vector store | P4.E7.S1.T1 | moderate | not_started | - HA vector store deployed<br>- Replication configured<br>- Failover tested |
| P4.E7.S1.T4 | Setup staging data snapshot | Create production-equivalent knowledge graph | P4.E7.S1.T2, P4.E7.S1.T3 | complex | not_started | - Data snapshot process documented<br>- KG populated with production-like data<br>- Embeddings generated<br>- Data versioned for testing |
| P4.E7.S1.T5 | Deploy all microservices (Staging) | Deploy all 4 services to staging K8s | P4.E7.S1.T1, P1.E5.S2.T7 | complex | not_started | - All services deployed<br>- Health checks passing<br>- Service mesh configured<br>- Inter-service communication verified |
| P4.E7.S1.T6 | Configure staging secrets | Setup secure credentials management | P4.E7.S1.T1 | moderate | not_started | - K8s Secrets configured<br>- Vault integration (if applicable)<br>- Secrets rotation tested<br>- No secrets in code |
| P4.E7.S1.T7 | Deploy Ollama cluster (Staging) | Setup production-grade LLM inference cluster | P4.E7.S1.T1 | complex | not_started | - Ollama cluster deployed<br>- GPU nodes configured<br>- Load balancing configured<br>- Model weights deployed |
| P4.E7.S1.T8 | Verify staging environment parity | Ensure staging matches production architecture | P4.E7.S1.T5, P4.E7.S1.T7 | moderate | not_started | - Parity checklist completed<br>- Configuration differences documented<br>- Resource allocations match<br>- Sign-off obtained |

#### Story 7.2: Monitoring & Observability Production Setup

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P4.E7.S2.T1 | Deploy production monitoring stack | Setup Prometheus, Grafana, Jaeger for production | P4.E7.S1.T1 | complex | not_started | - Monitoring deployed to Staging<br>- HA configuration<br>- Data retention configured<br>- Backup strategy defined |
| P4.E7.S2.T2 | Instrument all services with OpenTelemetry | Add distributed tracing to all microservices | P4.E7.S2.T1, P4.E7.S1.T5 | complex | not_started | - All services instrumented<br>- Traces visible in Jaeger<br>- Span relationships correct<br>- Error tracking working |
| P4.E7.S2.T3 | Create production dashboards | Build comprehensive Grafana dashboards | P4.E7.S2.T1 | complex | not_started | - Latency dashboard (P50/P95/P99)<br>- Throughput dashboard (RPS)<br>- Error rate dashboard<br>- Resource utilization dashboard<br>- Faithfulness monitoring dashboard |
| P4.E7.S2.T4 | Configure alerting rules | Setup Prometheus alerts for NFR violations | P4.E7.S2.T3 | moderate | not_started | - Alerts for P95 > 500ms<br>- Alerts for Faithfulness < 97%<br>- Alerts for error rate spikes<br>- Alerts for resource exhaustion<br>- Alert routing configured |
| P4.E7.S2.T5 | Implement log aggregation | Deploy ELK stack for centralized logging | P4.E7.S2.T1 | complex | not_started | - Elasticsearch cluster deployed<br>- Logstash/Fluentd configured<br>- Kibana dashboards created<br>- PII sanitization implemented |
| P4.E7.S2.T6 | Setup continuous Faithfulness monitoring | Sample production responses for quality checks | P4.E7.S2.T1, P3.E4.S1.T2 | moderate | not_started | - Sampling logic implemented<br>- Evaluation service integration<br>- Metrics exported to Prometheus<br>- Dashboard shows trends |
| P4.E7.S2.T7 | Create runbook documentation | Document incident response procedures | P4.E7.S2.T4 | moderate | not_started | - Runbook exists for each alert<br>- Escalation procedures defined<br>- Common issues documented<br>- Rollback procedures included |

#### Story 7.3: Continuous Deployment Pipeline

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P4.E7.S3.T1 | Implement Helm charts | Create Helm charts for all services | P1.E5.S2.T7 | complex | not_started | - Helm chart for each service<br>- Values files for envs<br>- Chart versioning configured<br>- Tested deployments |
| P4.E7.S3.T2 | Configure rolling update strategy | Setup zero-downtime K8s deployments | P4.E7.S3.T1 | moderate | not_started | - RollingUpdate strategy configured<br>- ReadinessProbes defined<br>- LivenessProbes defined<br>- Graceful shutdown implemented |
| P4.E7.S3.T3 | Implement blue/green deployment for inference | Setup canary/blue-green for inference service | P4.E7.S3.T1 | complex | not_started | - Blue/green infrastructure<br>- Traffic splitting configured<br>- Automated promotion logic<br>- Rollback tested |
| P4.E7.S3.T4 | Add CD pipeline to GitHub Actions | Automate deployment on main branch merge | P1.E5.S1.T7, P4.E7.S3.T1 | complex | not_started | - CD workflow file exists<br>- Deploys to staging automatically<br>- Requires approval for production<br>- Rollback capability |
| P4.E7.S3.T5 | Implement database migration pipeline | Automate Neo4j schema migrations | P4.E7.S3.T4 | complex | not_started | - Migration tool integrated (Liquibase/custom)<br>- Migrations version controlled<br>- Applied automatically in CD<br>- Rollback strategy |
| P4.E7.S3.T6 | Setup model weight deployment pipeline | Automate Ollama model updates | P4.E7.S3.T4 | moderate | not_started | - Model storage configured (S3/artifact registry)<br>- Deployment script exists<br>- Version tracking<br>- Rollback capability |
| P4.E7.S3.T7 | Implement feature flags | Add runtime feature toggle capability | P4.E7.S1.T5 | moderate | not_started | - Feature flag library integrated<br>- Flags configurable without deploy<br>- A/B testing supported<br>- Admin UI available |

#### Story 7.4: Security & Compliance

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P4.E7.S4.T1 | Conduct security audit | Perform comprehensive security review | P4.E7.S1.T8 | complex | not_started | - Audit completed by security team<br>- Vulnerabilities documented<br>- Remediation plan created<br>- Critical issues fixed |
| P4.E7.S4.T2 | Implement authentication | Add robust auth to api-gateway | P2.E3.S3.T4 | moderate | not_started | - Auth middleware implemented<br>- JWT/OAuth configured<br>- Role-based access control<br>- Session management secure |
| P4.E7.S4.T3 | Implement rate limiting | Add rate limits to prevent abuse | P4.E7.S4.T2 | moderate | not_started | - Rate limiting middleware<br>- Per-user limits configured<br>- Redis-backed counters<br>- 429 responses for violations |
| P4.E7.S4.T4 | Setup WAF and DDoS protection | Configure cloud WAF | P4.E7.S1.T1 | moderate | not_started | - WAF rules configured<br>- DDoS protection enabled<br>- Bot detection configured<br>- Logging integrated |
| P4.E7.S4.T5 | Implement PII sanitization | Ensure no PII in logs/metrics | P4.E7.S2.T5 | moderate | not_started | - Sanitization logic implemented<br>- Applied to all log statements<br>- Tested with PII samples<br>- Compliance verified |
| P4.E7.S4.T6 | Configure network policies | Setup K8s network policies | P4.E7.S1.T1 | moderate | not_started | - Network policies defined<br>- Service-to-service traffic restricted<br>- Egress controls configured<br>- Tested in staging |
| P4.E7.S4.T7 | Implement secrets rotation | Automate credential rotation | P4.E7.S1.T6 | complex | not_started | - Rotation scripts created<br>- Scheduled rotation configured<br>- Zero-downtime rotation verified<br>- Alerts for rotation failures |

#### Story 7.5: NFR Verification & Go-Live

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P4.E7.S5.T1 | Execute staging performance tests | Comprehensive load testing on staging | P4.E7.S1.T8, P2.E5.S4.T2 | complex | not_started | - Load tests executed<br>- Sustained 500 RPS achieved<br>- P95 latency < 500ms verified<br>- No errors under load |
| P4.E7.S5.T2 | Execute staging regression tests | Run full golden dataset on staging | P4.E7.S1.T8, P3.E4.S3.T1 | moderate | not_started | - All test cases executed<br>- Faithfulness ≥ 97% verified<br>- Evidence Coverage measured<br>- Answer Accuracy measured |
| P4.E7.S5.T3 | Verify availability NFR | Test failover and recovery | P4.E7.S1.T2, P4.E7.S1.T3 | complex | not_started | - Chaos testing performed<br>- Service failover verified<br>- Database failover tested<br>- Recovery time measured |
| P4.E7.S5.T4 | Execute cost analysis | Measure actual token and infrastructure costs | P4.E7.S5.T1 | moderate | not_started | - Token usage measured<br>- Infrastructure cost calculated<br>- Cost per query determined<br>- Budget compliance verified |
| P4.E7.S5.T5 | Create NFR verification report | Comprehensive report on all NFRs | P4.E7.S5.T1, P4.E7.S5.T2, P4.E7.S5.T3, P4.E7.S5.T4 | moderate | not_started | - Report document exists<br>- All NFRs measured<br>- Pass/fail for each NFR<br>- Gaps documented with mitigation |
| P4.E7.S5.T6 | Conduct DR drill | Test disaster recovery procedures | P4.E7.S1.T2 | complex | not_started | - DR drill executed<br>- RTO/RPO measured<br>- Issues documented<br>- Procedures updated |
| P4.E7.S5.T7 | Executive sign-off | Final approval for production launch | P4.E7.S5.T5, P4.E7.S5.T6, P4.E7.S4.T1 | simple | not_started | - NFR report reviewed<br>- Security audit passed<br>- Stakeholder approval obtained<br>- Go-live date set |
| P4.E7.S5.T8 | Production deployment | Deploy to production environment | P4.E7.S5.T7, P4.E7.S3.T4 | complex | not_started | - Production deployment successful<br>- Health checks passing<br>- Monitoring active<br>- No critical errors |
| P4.E7.S5.T9 | Post-launch monitoring | Monitor system for 48 hours | P4.E7.S5.T8 | moderate | not_started | - 48-hour monitoring completed<br>- NFRs maintained<br>- No critical incidents<br>- Launch declared successful |

### EPIC 5: DevOps & Deployment (Sub-Agent Integration)

#### Story 5.5: Sub-Agent Ecosystem (Optional/Advanced)

| Task ID | Task Name | Description | Dependencies | Complexity | Status | Acceptance Criteria |
|---------|-----------|-------------|--------------|------------|--------|---------------------|
| P4.E5.S5.T1 | Deploy message queue (Kafka) | Setup Kafka for agent communication | P4.E7.S1.T1 | complex | not_started | - Kafka cluster deployed<br>- Topics created<br>- HA configuration<br>- Monitoring integrated |
| P4.E5.S5.T2 | Create sub-agent orchestrator service | Central service to manage agents | P4.E5.S5.T1 | complex | not_started | - Orchestrator service exists<br>- Agent registration API<br>- Task distribution logic<br>- Health monitoring |
| P4.E5.S5.T3 | Implement Coverage Maximizer Agent | Agent to generate tests on coverage failures | P4.E5.S5.T2, P3.E4.S4.T8 | very_complex | not_started | - Agent service deployed<br>- Subscribes to coverage.fail topic<br>- Generates test code<br>- Creates PRs automatically<br>- PR acceptance rate tracked |
| P4.E5.S5.T4 | Implement Dependency Resolver Agent | Agent to optimize CI/CD DAG | P4.E5.S5.T2, P1.E5.S1.T1 | very_complex | not_started | - Agent service deployed<br>- Analyzes code dependencies<br>- Generates optimized DAG<br>- Integrates with CI pipeline |
| P4.E5.S5.T5 | Implement Performance Refactoring Agent | Agent to suggest optimizations | P4.E5.S5.T2, P4.E7.S2.T2 | very_complex | not_started | - Agent service deployed<br>- Analyzes traces and metrics<br>- Suggests code improvements<br>- Creates PRs with refactorings<br>- Impact measured |
| P4.E5.S5.T6 | Create agent monitoring dashboard | Track agent performance and contributions | P4.E5.S5.T3, P4.E5.S5.T4, P4.E5.S5.T5 | moderate | not_started | - Dashboard exists<br>- PR acceptance rates visible<br>- Agent latency tracked<br>- Contribution metrics displayed |

---

## Dependency Chain Visualization

### Critical Path (Longest Sequential Chain)

```
Foundation → Core Infrastructure → Database Setup → KGC Pipeline → LangGraph → Golden Dataset → Optimization → Production
```

**Detailed Critical Path:**
1. P1.E1.S1.T1 (Monorepo Init)
2. P1.E1.S2.T2 (FactionSchema)
3. P2.E2.S1.T2 (Neo4j Deploy)
4. P2.E2.S1.T3 (Neo4j Driver)
5. P2.E2.S1.T4 (KG Schema)
6. P2.E2.S3.T6 (Canonicalize Stage)
7. P2.E3.S2.T9 (LangGraph Workflow)
8. P3.E4.S2.T7 (Expert Dataset Validation)
9. P3.E6.S1.T5 (A/B Test Prompts)
10. P4.E7.S5.T8 (Production Deployment)

**Estimated Duration**: ~18-20 weeks if executed sequentially

### Parallelization Opportunities

#### Phase 1 Parallel Tracks
- **Track A**: Monorepo + Types (P1.E1.S1, P1.E1.S2)
- **Track B**: Prompt Library (P1.E1.S3)
- **Track C**: IaC Foundation (P1.E1.S4)
- **Track D**: CI/CD Pipeline (P1.E5.S1)
- **Track E**: Docker Containerization (P1.E5.S2)

#### Phase 2 Parallel Tracks
- **Track A**: Neo4j + KGC (P2.E2.S1, P2.E2.S3)
- **Track B**: Vector Store (P2.E2.S2)
- **Track C**: Ollama Integration (P2.E3.S1)
- **Track D**: LangGraph (P2.E3.S2)
- **Track E**: MCP Server (P2.E3.S3)

#### Phase 3 Parallel Tracks
- **Track A**: Evaluation Service (P3.E4.S1, P3.E4.S3)
- **Track B**: Golden Dataset (P3.E4.S2)
- **Track C**: Unit/Integration Tests (P3.E4.S4)
- **Track D**: Prompt Optimization (P3.E6.S1)
- **Track E**: Model Optimization (P3.E6.S2)
- **Track F**: Retrieval Optimization (P3.E6.S3)

#### Phase 4 Parallel Tracks
- **Track A**: Staging Infrastructure (P4.E7.S1)
- **Track B**: Monitoring Setup (P4.E7.S2)
- **Track C**: CD Pipeline (P4.E7.S3)
- **Track D**: Security (P4.E7.S4)

---

## Progress Tracking Dashboard

### Phase Summary

| Phase | Total Tasks | Not Started | In Progress | Completed | Blocked | Progress % |
|-------|-------------|-------------|-------------|-----------|---------|------------|
| Phase 1 | 52 | 52 | 0 | 0 | 0 | 0% |
| Phase 2 | 66 | 66 | 0 | 0 | 0 | 0% |
| Phase 3 | 64 | 64 | 0 | 0 | 0 | 0% |
| Phase 4 | 58 | 58 | 0 | 0 | 0 | 0% |
| **Total** | **240** | **240** | **0** | **0** | **0** | **0%** |

### Epic Summary

| Epic | Total Tasks | Complexity Breakdown | Progress % |
|------|-------------|---------------------|------------|
| E1: Foundational Governance | 34 | Trivial: 6, Simple: 10, Moderate: 15, Complex: 3, Very Complex: 0 | 0% |
| E2: Data Write Path | 35 | Trivial: 0, Simple: 3, Moderate: 16, Complex: 14, Very Complex: 2 | 0% |
| E3: Execution Path | 36 | Trivial: 1, Simple: 3, Moderate: 20, Complex: 12, Very Complex: 0 | 0% |
| E4: Testing & QA | 38 | Trivial: 1, Simple: 4, Moderate: 16, Complex: 17, Very Complex: 0 | 0% |
| E5: DevOps & Deployment | 33 | Trivial: 3, Simple: 7, Moderate: 12, Complex: 8, Very Complex: 3 | 0% |
| E6: Optimization | 25 | Trivial: 0, Simple: 1, Moderate: 14, Complex: 9, Very Complex: 1 | 0% |
| E7: Production Hardening | 39 | Trivial: 1, Simple: 1, Moderate: 17, Complex: 20, Very Complex: 0 | 0% |

### Complexity Distribution

| Complexity | Count | Percentage | Estimated Hours |
|------------|-------|------------|-----------------|
| Trivial | 12 | 5% | 6-12 hours total |
| Simple | 29 | 12% | 58-116 hours total |
| Moderate | 110 | 46% | 880-1760 hours total |
| Complex | 83 | 35% | 1992-3320 hours total |
| Very Complex | 6 | 2% | 240+ hours total |
| **Total** | **240** | **100%** | **~3176-5208 hours** |

### Estimated Team Sizing

**Assumptions:**
- Average developer works 6 productive hours/day
- 20 working days/month (4 weeks)
- 4 months total (20 weeks)
- Target: Complete in 20 weeks

**Calculations:**
- Total hours needed: ~4,200 hours (average)
- Available hours per developer in 20 weeks: 600 hours
- **Recommended team size: 7-8 developers**

**Suggested Team Structure:**
1. **Tech Lead** - Architecture oversight, critical path tasks
2. **Backend Dev 1** - Neo4j, KGC pipeline (Epic 2)
3. **Backend Dev 2** - Vector store, retrieval (Epic 2, 3)
4. **Backend Dev 3** - LangGraph, Ollama integration (Epic 3)
5. **Backend Dev 4** - API Gateway, MCP (Epic 3)
6. **QA Engineer** - Testing, golden dataset (Epic 4)
7. **DevOps Engineer** - IaC, CI/CD, deployment (Epic 1, 5, 7)
8. **ML/Optimization Engineer** - Prompt optimization, model tuning (Epic 6)

---

## Task Execution Guidelines

### For Human Developers

1. **Claim a Task**: Update status to `in_progress` and add your name
2. **Check Dependencies**: Ensure all dependency tasks are `completed`
3. **Follow Acceptance Criteria**: All criteria must be met
4. **Update Status**: Move to `completed` when all criteria verified
5. **Document Blockers**: Set status to `blocked` with reason if stuck

### For AI Coding Agents

1. **Task Selection**: Choose tasks with status `not_started` and all dependencies `completed`
2. **Complexity Awareness**: Start with `trivial` or `simple` tasks before `complex`
3. **Acceptance Verification**: Ensure all acceptance criteria can be verified programmatically
4. **Code Quality**: Follow all standards in P1.E1.S1.T2, P1.E1.S1.T3, P1.E1.S1.T6
5. **Testing**: Write tests as part of task completion (not as separate task unless specified)
6. **Documentation**: Update relevant docs when implementing features
7. **Pull Requests**: Create PR for each completed task with link to task ID

### Parallel Execution Rules

1. **Check Dependencies**: Never start a task if dependencies are not `completed`
2. **Avoid Conflicts**: Tasks in different Epics can usually run in parallel
3. **File Conflicts**: Tasks modifying same files must be sequential
4. **Database State**: KGC and inference tasks can run in parallel (read/write separation)
5. **Resource Sharing**: Test tasks should use isolated/ephemeral resources

---

## Maintenance & Updates

**This document should be updated:**
- Weekly during active development
- When task status changes
- When blockers are encountered or resolved
- When scope changes require new tasks
- When task estimates prove inaccurate

**Version History:**
- v1.0.0 (2025-11-09): Initial comprehensive task breakdown

**Contact:**
For questions about this task list, consult the CLAUDE.md context guide and specification documents in /specs/.

---

## Agent Task Assignment Matrix

### Agent-to-Task Mapping

| Agent | Applicable Tasks | Automation Level | Trigger |
|-------|-----------------|------------------|---------|
| architecture-validator | Code reviews, architectural compliance, LangGraph updates | Automatic | Pre-commit hook, PR workflow |
| test-generator | Unit/integration test creation, coverage remediation | Semi-automatic | Coverage < 85%, new code without tests |
| dependency-mapper | CI/CD DAG optimization, dependency audits | Semi-automatic | New package/import changes, weekly optimization |
| documentation-sync | API docs, MCP specs, JSDoc synchronization | Automatic | Schema/API changes, PR merge, weekly audit |
| schema-evolution | Neo4j migrations, schema safety checks | Guided | Schema/ontology diffs, pre-deploy validation |
| prompt-optimizer | Prompt quality/cost tuning, A/B testing | Scheduled / On-demand | Weekly run, performance regression, manual request |
| performance-profiler | Latency/cost analysis, optimization recommendations | Scheduled / Alert-driven | NFR alerts, weekly profiling |
| agent-orchestrator | PR/daily/weekly workflow coordination, dependency enforcement | Automatic | PR events, cron schedules, manual orchestration |
| agent-framework-architect | Framework abstractions, shared integration design | Manual | New agent onboarding, refactor initiatives |
| deployment-ops-specialist | Scripts, monitoring, cost tracking, runbooks | Manual / Scheduled | Operational backlog, release readiness, quarterly reviews |

### Agent-Enhanced Execution Guidelines

**For Human Developers with Agent Support:**
1. Run `architecture-validator` before committing or opening PRs; resolve blockers prior to further work.
2. Use `test-generator` after implementing features to populate baseline tests and raise coverage.
3. Invoke `documentation-sync` whenever APIs, schemas, or shared packages change to keep documentation current.
4. Collaborate with `schema-evolution` for any Neo4j/Zod schema adjustments—never merge breaking changes without generated migrations.
5. Engage `deployment-ops-specialist` to add scripts, dashboards, and cost reports before major releases.

**Agent Workflow Integration:**
- **Phase 1 Foundation:** automate validation (`architecture-validator`), documentation (`documentation-sync`), and script setup (`deployment-ops-specialist`).
- **Phase 2 RAG Pipeline:** schedule dependency and schema checks (`dependency-mapper`, `schema-evolution`) alongside testing (`test-generator`).
- **Phase 3 QA & Optimization:** run optimization agents (`prompt-optimizer`, `performance-profiler`) and extend coverage with `test-generator`.
- **Phase 4 Production Readiness:** orchestrate full workflows via `agent-orchestrator`, confirm documentation (`documentation-sync`), migrations (`schema-evolution`), and Ops readiness (`deployment-ops-specialist`).

Refer to `.claude/agents/<agent>.md` for detailed loop patterns, verification steps, and configuration guidance before assigning tasks to each agent. 

---

**End of Implementation Tasks Document**
