# 🏰 ACE - Architected Consistency Engine

**AI-Powered Fantasy World-Building with Knowledge Graphs**

ACE is a high-performance AI tool stack for building deep, internally consistent RPG world foundations using Large Language Models (LLMs), Graph RAG, and architectural enforcement rather than probabilistic generation.

---

## 🌟 Features

- **Hybrid GraphRAG**: Combines Neo4j knowledge graphs with Qdrant vector search
- **Architectural Enforced Consistency (AEC)**: Validation loops ensure consistency
- **Agent Orchestration**: Historian → Narrator → Consistency Checker workflow
- **Entity Extraction**: Automatically identifies Factions, Characters, Locations, Resources, Events
- **Self-Healing**: Iterative refinement with up to 3 validation attempts
- **Beautiful Web UI**: React-based interface with interactive graph visualization
- **Open-Weight Models**: Uses Ollama for cost-efficient local LLM inference

---

## 🏗️ Architecture

### Microservices

- **API Gateway** (Port 3000): CORS-enabled routing to all services
- **Ingestion Engine** (Port 3200): EDC pipeline (Extract-Define-Canonicalize)
- **Inference Service** (Port 3100): Agent workflow orchestration
- **Evaluation Service** (Port 3300): Quality metrics (stub)
- **Web UI** (Port 3500): React + Vite frontend

### Infrastructure

- **Neo4j** (Ports 7474, 7687): Knowledge graph database
- **Qdrant** (Ports 6333, 6334): Vector database
- **Ollama** (Port 11434): LLM inference server (llama3.2:3b)

### Shared Packages

- `@ace/core-types`: Zod schemas for entities and relationships
- `@ace/neo4j-utilities`: Database driver and Cypher queries
- `@ace/prompt-library`: Versioned prompt templates
- `@ace/shared-logging`: Structured JSON logging
- `@ace/vector-client`: Qdrant + Ollama embedding client

---

## 🚀 Quick Start

### Prerequisites

- **Bun** v1.3+ (JavaScript runtime)
- **Docker** & **Docker Compose**
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/one-ace.git
cd one-ace

# Install dependencies
bun install

# Start infrastructure services
docker-compose up -d neo4j qdrant ollama

# Pull the LLM model (first time only)
docker exec ace-ollama ollama pull llama3.2:3b
docker exec ace-ollama ollama pull nomic-embed-text

# Start application services
docker-compose up -d api-gateway ingestion-engine inference-service web-ui
```

### Access

- **Web UI**: http://localhost:3500
- **API Gateway**: http://localhost:3000
- **Neo4j Browser**: http://localhost:7474 (neo4j/acepassword)

---

## 📖 Usage

### 1. Submit Fantasy Lore (Web UI)

1. Open http://localhost:3500
2. Enter fantasy lore text:
   ```
   The Crimson Empire, led by Emperor Valen, controls the Ruby Mines
   in the Bloodstone Mountains. Their alliance with the Silver Covenant
   strengthens trade routes.
   ```
3. Click "Extract Entities"
4. Watch real-time job status
5. View knowledge graph visualization

### 2. Submit Lore (API)

```bash
curl -X POST http://localhost:3000/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The Crimson Empire controls the Ruby Mines..."
  }'

# Response: {"jobId": "job-1234567890"}
```

### 3. Query Job Status

```bash
curl http://localhost:3000/jobs/job-1234567890
```

### 4. Query Knowledge Graph (Agent Workflow)

```bash
curl -X POST http://localhost:3000/workflow/run \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What resources does the Crimson Empire control?"
  }'
```

**Response:**
```json
{
  "success": true,
  "response": "The Crimson Empire controls the Ruby Mines...",
  "entities": [
    {
      "type": "Faction",
      "name": "Crimson Empire",
      "properties": {...}
    }
  ],
  "relationships": [...],
  "validationResult": {
    "isValid": true,
    "consistencyScore": 0.95
  },
  "iterations": 1
}
```

---

## 🧪 Testing

### Run End-to-End Tests

```bash
./test-workflow.sh
```

This script tests:
- Health checks for all services
- Ingestion pipeline (EDC)
- Neo4j knowledge graph writes
- Agent workflow (Historian + Narrator + Consistency Checker)
- Context retrieval and validation

### Manual Testing

```bash
# Test ingestion
curl -X POST http://localhost:3200/ingest \
  -H "Content-Type: application/json" \
  -d '{"text": "The Iron Legion defends the northern border."}'

# Test workflow
curl -X POST http://localhost:3100/workflow/run \
  -H "Content-Type: application/json" \
  -d '{"query": "Who defends the northern border?"}'
```

---

## 🔧 Development

### Project Structure

```
one-ace/
├── apps/                      # Microservices
│   ├── api-gateway/           # HTTP routing
│   ├── ingestion-engine/      # EDC pipeline
│   ├── inference-service/     # Agent orchestration
│   ├── evaluation-service/    # Quality metrics
│   └── web-ui/               # React frontend
├── packages/                  # Shared libraries
│   ├── core-types/           # Zod schemas
│   ├── neo4j-utilities/      # Database client
│   ├── prompt-library/       # Prompts
│   ├── shared-logging/       # Logging
│   └── vector-client/        # Qdrant client
├── infra/                    # Terraform IaC
├── specs/                    # Design documents
└── docker-compose.yml        # Local dev environment
```

### Build & Run Locally

```bash
# Lint
bun run lint

# Type check
bun run typecheck

# Build
bun run build

# Run individual services
cd apps/api-gateway
bun run start

cd apps/ingestion-engine
bun run start

cd apps/inference-service
bun run start

cd apps/web-ui
bun run dev
```

### Environment Variables

```bash
# API Gateway
API_GATEWAY_PORT=3000
INGESTION_ENGINE_URL=http://ingestion-engine:3200
INFERENCE_SERVICE_URL=http://inference-service:3100

# Ingestion Engine
INGESTION_ENGINE_PORT=3200
NEO4J_URI=bolt://neo4j:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=acepassword
QDRANT_URL=http://qdrant:6333
OLLAMA_HOST=http://ollama:11434

# Inference Service
INFERENCE_SERVICE_PORT=3100
(same Neo4j, Qdrant, Ollama vars)

# Web UI
VITE_API_URL=http://localhost:3000
```

---

## 🤖 Agent Workflow

### Historian Agent
**Purpose**: Retrieve relevant context using GraphRAG

1. Extracts keywords from user query
2. Performs vector search in Qdrant (semantic similarity)
3. Queries Neo4j for entity relationships (graph traversal)
4. Calculates relevance score
5. Returns combined context

### Narrator Agent
**Purpose**: Generate consistent lore based on context

1. Loads versioned prompt template
2. Builds context summary from Historian results
3. Calls Ollama LLM (llama3.2:3b) with JSON format
4. Parses structured output (text, entities, relationships)
5. Returns generated lore with confidence score

### Consistency Checker Agent
**Purpose**: Validate generated lore for consistency

1. Validates entities against Zod schemas
2. Queries Neo4j for contradictions
3. Compares properties with existing entities
4. Calculates consistency score
5. Returns validation result with suggested fixes

### Workflow Orchestration
```
User Query
    ↓
Historian (retrieve context)
    ↓
Narrator (generate lore)
    ↓
Consistency Checker (validate)
    ↓
    ├─ Valid? → Return success
    └─ Invalid? → Retry Narrator (up to 3 times)
```

---

## 📊 Knowledge Graph Schema

### Entity Types

- **Faction**: name, alignment, core_motivation, leader_name
- **Character**: name, role, faction_affiliation
- **Location**: name, type (city/stronghold/etc), climate
- **Resource**: name, type (military/economic/etc), strategic_value
- **Event**: name, type (battle/treaty/etc), date, participants

### Relationship Types

- `CONTROLS_RESOURCE`: Faction → Resource
- `IS_ALLY_OF`: Faction ↔ Faction
- `PARTICIPATED_IN`: Character/Faction → Event
- `LOCATED_IN`: Resource/Faction → Location
- `COMMANDS`: Character → Faction
- `MEMBER_OF`: Character → Faction

---

## 🎯 Roadmap

### Phase 3 ✅ (Complete)
- [x] Hybrid GraphRAG (Neo4j + Qdrant)
- [x] Agent orchestration (Historian, Narrator, Consistency Checker)
- [x] Validation loops with self-healing
- [x] Web UI with graph visualization

### Phase 4 (Future)
- [ ] Evaluation service (LLM-as-a-Judge)
- [ ] Golden dataset for regression testing
- [ ] Advanced graph queries (multi-hop reasoning)
- [ ] Prompt A/B testing
- [ ] Production deployment (K8s, monitoring)

---

## 📚 Documentation

- **Specifications**: See `specs/` directory
  - `ai_stack.md`: Technology selection and architecture
  - `architecture_blueprint.md`: Technical blueprint
  - `core_architecture.md`: Implementation details
  - `implementation_blueprint.md`: Detailed specs
  - `implementation_plan.md`: CI/CD and infrastructure

- **Context Guide**: `CLAUDE.md`
- **Codebase Analysis**: `artifacts/comprehensive-codebase-analysis.md`

---

## 🛠️ Troubleshooting

### Services won't start

```bash
# Check Docker
docker-compose ps

# View logs
docker-compose logs api-gateway
docker-compose logs ingestion-engine
docker-compose logs inference-service

# Restart services
docker-compose restart
```

### Ollama model not found

```bash
# Pull models
docker exec ace-ollama ollama pull llama3.2:3b
docker exec ace-ollama ollama pull nomic-embed-text

# Verify models
docker exec ace-ollama ollama list
```

### Neo4j connection issues

```bash
# Check Neo4j health
curl http://localhost:7474

# Access Neo4j browser
# http://localhost:7474
# Username: neo4j
# Password: acepassword
```

### Port conflicts

```bash
# Change ports in docker-compose.yml or .env
# Default ports:
# - 3000: API Gateway
# - 3100: Inference Service
# - 3200: Ingestion Engine
# - 3300: Evaluation Service
# - 3500: Web UI
# - 7474/7687: Neo4j
# - 6333/6334: Qdrant
# - 11434: Ollama
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **TypeScript**: Strict mode enabled
- **Linting**: Biome (`bun run lint`)
- **Formatting**: Biome auto-format
- **Naming**: camelCase (variables), PascalCase (types), UPPER_SNAKE_CASE (Neo4j relationships)

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

Built with:
- **Bun**: High-performance JavaScript runtime
- **Neo4j**: Graph database
- **Qdrant**: Vector database
- **Ollama**: Local LLM inference
- **LangChain**: Agent orchestration framework
- **React**: UI framework
- **Cytoscape.js**: Graph visualization

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/one-ace/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/one-ace/discussions)
- **Documentation**: `specs/` directory

---

**Happy World-Building! 🏰✨**
