# ACE Project - Critical TODOs

**Generated**: 2025-11-15
**Status**: 35-40% Complete

---

## 🚨 CRITICAL BLOCKERS (P1)

These items are **blocking** and must be completed to achieve a functional MVP:

### 1. ⚠️ Install LangGraph
**Status**: ❌ Not Started
**Estimated Effort**: 30 minutes
**File**: `apps/inference-service/package.json`

```bash
cd /home/user/one-ace
bun install langchain @langchain/core @langchain/community langgraph
```

**Why Critical**: Core orchestration framework - entire inference service depends on this

---

### 2. ⚠️ Implement LangGraph FSM
**Status**: ❌ Not Started
**Estimated Effort**: 2-3 days
**Files**:
- `apps/inference-service/src/workflow.ts` (~400 lines)
- `apps/inference-service/src/agents/` (5 agent files)

**Deliverables**:
- [ ] Define StateGraph
- [ ] Implement Request Processor node
- [ ] Implement Historian Agent node
- [ ] Implement Narrator Agent node
- [ ] Implement Consistency Checker node
- [ ] Implement Human Review node
- [ ] Configure conditional edges
- [ ] Add LangSmith integration

**Reference**: `specs/ai_stack.md` Section III.2-III.3

---

### 3. ⚠️ Implement Historian Agent (GraphRAG)
**Status**: ❌ Not Started
**Estimated Effort**: 1-2 days
**File**: `apps/inference-service/src/agents/historian.ts` (~250 lines)

**Requirements**:
- [ ] Vector search (Qdrant integration)
- [ ] Graph traversal (Neo4j Cypher)
- [ ] Hybrid result combination
- [ ] Context assembly

**Dependencies**:
- Install Qdrant client: `bun install @qdrant/js-client-rest`
- Install Ollama client (needs creation)

**Reference**: `specs/architecture_blueprint.md` Section 3.3

---

### 4. ⚠️ Implement Narrator Agent
**Status**: ❌ Not Started
**Estimated Effort**: 1 day
**File**: `apps/inference-service/src/agents/narrator.ts` (~200 lines)

**Requirements**:
- [ ] Ollama API integration
- [ ] Prompt loading from `@ace/prompt-library`
- [ ] Structured output (withStructuredOutput)
- [ ] Zod schema enforcement

**Dependencies**: Ollama client package

**Reference**: `specs/implementation_blueprint.md` Story C.3

---

### 5. ⚠️ Implement Consistency Checker Agent
**Status**: ❌ Not Started
**Estimated Effort**: 1 day
**File**: `apps/inference-service/src/agents/consistency-checker.ts` (~150 lines)

**Requirements**:
- [ ] Zod schema validation
- [ ] LLM-based contradiction detection
- [ ] Multi-hop reasoning checks
- [ ] Return PASS/FAIL decision

**Reference**: `specs/ai_stack.md` Section III.3

---

### 6. ⚠️ Implement Real Neo4j Writes
**Status**: ⚠️ Mocked (stub exists)
**Estimated Effort**: 1 day
**File**: `apps/ingestion-engine/src/graph-writer.ts` (modify existing 68 lines)

**Current**: Interface defined, implementation mocked
**Needed**: Replace mocks with real Neo4j transactions

**Requirements**:
- [ ] Use `@ace/neo4j-utilities` driver
- [ ] Implement `writeEntity()` with MERGE
- [ ] Implement `writeRelationship()` with MERGE
- [ ] Add transaction support
- [ ] Error handling + rollback

**Reference**: `specs/implementation_blueprint.md` Story B.3

---

### 7. ⚠️ Ollama Integration
**Status**: ❌ Not Started (Docker exists, no code)
**Estimated Effort**: 1 day
**Files**:
- `packages/ollama-client/src/index.ts` (~200 lines)
- `packages/ollama-client/src/types.ts` (~50 lines)

**Requirements**:
- [ ] REST API client
- [ ] `/api/generate` endpoint
- [ ] `/api/embeddings` endpoint
- [ ] `/api/chat` endpoint
- [ ] Model management
- [ ] TypeScript types

**Reference**: `specs/architecture_blueprint.md` Section 4.2

---

### 8. ⚠️ Create Golden Dataset
**Status**: ❌ Not Started
**Estimated Effort**: 2-3 days (domain expert effort)
**Directory**: `/home/user/one-ace/artifacts/golden-dataset/`

**Requirements**:
- [ ] Create 50+ test cases
- [ ] Cover common scenarios
- [ ] Cover edge cases
- [ ] Cover adversarial cases
- [ ] JSON format with input/expected output
- [ ] Domain expert verification

**Reference**: `specs/architecture_blueprint.md` Section 5.1

---

### 9. ⚠️ LLM-as-a-Judge Framework
**Status**: ❌ Not Started (stub exists)
**Estimated Effort**: 2-3 days
**File**: `apps/evaluation-service/src/index.ts` (replace 47-line stub)

**Requirements**:
- [ ] Faithfulness Score (≥ 97% target)
- [ ] Evidence Coverage
- [ ] Answer Accuracy
- [ ] Recall@k
- [ ] Test runner (Golden Dataset)
- [ ] Report generation
- [ ] CI/CD integration (HTTP endpoint)

**Reference**: `specs/architecture_blueprint.md` Sections 5.2-5.3

---

### 10. ⚠️ Test Coverage to 85%+
**Status**: ❌ Current < 10%
**Estimated Effort**: 1-2 weeks (ongoing)
**Target**: ≥ 85% line coverage

**Required Tests**:
- [ ] Unit tests for all packages
- [ ] Integration tests (ingestion, inference)
- [ ] Agent state transition tests
- [ ] E2E workflow tests
- [ ] Update CI to enforce 85% threshold

**Reference**: `specs/implementation_blueprint.md` Section 4.1

---

## 📋 HIGH PRIORITY (P2)

Required for production but not blocking MVP:

### 11. MCP (Model Context Protocol) Implementation
**Status**: ⚠️ Partial (basic endpoints exist)
**Estimated Effort**: 2 days
**File**: `apps/api-gateway/src/mcp/index.ts` (~300 lines)

**Requirements**:
- [ ] MCP server endpoints
- [ ] Tool definitions (get_faction_context, create_new_faction)
- [ ] JSON Schema validation
- [ ] Auth middleware
- [ ] Rate limiting

---

### 12. Prompt Versioning API
**Status**: ⚠️ Library exists, no API
**Estimated Effort**: 1 day
**File**: `apps/api-gateway/src/routes/prompts.ts` (~150 lines)

**Requirements**:
- [ ] GET /prompts/:id/:version
- [ ] GET /prompts/:id/latest
- [ ] Metadata support
- [ ] Version comparison

---

### 13. Monitoring & Observability
**Status**: ❌ Not Started
**Estimated Effort**: 2-3 days
**Files**:
- `infra/monitoring/prometheus.yml`
- `infra/monitoring/grafana-dashboards/*.json`
- `packages/telemetry/src/index.ts`

**Requirements**:
- [ ] Prometheus metrics (P95 latency, RPS, errors)
- [ ] Grafana dashboards
- [ ] OpenTelemetry distributed tracing
- [ ] Cost tracking (token usage)

---

### 14. Deployment Infrastructure
**Status**: ❌ Not Started
**Estimated Effort**: 1 week
**Files**:
- `infra/terraform/*.tf`
- `infra/k8s/*.yaml`
- `.github/workflows/deploy.yml`

**Requirements**:
- [ ] Kubernetes manifests
- [ ] Blue-green deployment
- [ ] Secrets management
- [ ] Environment parity (dev/staging/prod)

---

## 🔧 MEDIUM PRIORITY (P3)

Optimization & enhancement:

### 15. Prompt Optimization (CoT, Few-Shot)
- [ ] Chain-of-Thought prompting
- [ ] Few-shot example library
- [ ] A/B testing framework

### 16. Model Quantization
- [ ] 4-bit/8-bit quantization
- [ ] Performance benchmarking
- [ ] Quality regression testing

### 17. ANN Indexing (HNSW)
- [ ] Configure HNSW in Qdrant
- [ ] Optimize index parameters
- [ ] Benchmark latency

### 18. Sub-Agent Ecosystem
- [ ] Coverage Maximizer Agent
- [ ] Dependency Resolver Agent
- [ ] Performance Refactoring Agent

---

## 📊 Progress Summary

| Phase | Completion % | Status |
|-------|--------------|--------|
| **Phase 1: Foundation** | 95% | ✅ Nearly Complete |
| **Phase 2: RAG Pipeline** | 40% | ⚠️ In Progress |
| **Phase 3: QA & Optimization** | 5% | ❌ Not Started |
| **Phase 4: Production Readiness** | 0% | ❌ Not Started |

**Overall Project Progress**: **35-40% Complete**

---

## 🎯 Immediate Next Steps (This Week)

1. **Install LangGraph** (30 min)
   ```bash
   bun install langchain @langchain/core @langchain/community langgraph
   ```

2. **Create Minimal FSM** (1 day)
   - 2-node graph: Narrator → Consistency Checker
   - Mock Ollama responses
   - Validate state transitions

3. **Connect Real Neo4j** (1 day)
   - Modify `graph-writer.ts`
   - Test with small dataset

4. **Start Golden Dataset** (ongoing)
   - Create 10 faction creation cases
   - Manual validation

---

## 📈 Short-Term Goals (Next 2 Weeks)

5. **Complete Inference Service** (1 week)
   - All 5 agent nodes
   - Ollama integration
   - E2E test

6. **Basic Evaluation** (3-4 days)
   - Faithfulness metric only
   - Regression test automation

7. **Test Coverage to 50%** (ongoing)
   - Critical paths first

---

## 🚀 Medium-Term Goals (4-6 Weeks)

8. **Complete Phase 2** - Functional RAG pipeline
9. **Begin Phase 3** - QA & Optimization
10. **Production Readiness Planning** - Prepare for Phase 4

---

**Last Updated**: 2025-11-15
**Next Review**: After LangGraph FSM implementation
