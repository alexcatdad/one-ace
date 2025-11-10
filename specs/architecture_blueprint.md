# **ACE Project Technical Architecture Blueprint: Graph RAG and Bun Performance System**

## **Section 1: Executive Summary and Strategic Context**

### **1.1 Project Mandate and Core Objectives (The ACE Value Proposition)**

The ACE project is mandated to establish a high-performance, cost-efficient, and supremely consistent intelligent system utilizing open-weight Large Language Models (LLMs) orchestrated by the Bun JavaScript runtime. The primary operational objective is to surpass standard Retrieval-Augmented Generation (RAG) performance by implementing a Hybrid Graph RAG architecture. This approach directly addresses the critical challenge of hallucination and inconsistency often found in generative AI applications.  
The key value driver for ACE is the delivery of superior output consistency and grounded responses, achieved through utilizing a structured knowledge base—the Knowledge Graph. The architectural decision to leverage the Bun runtime is fundamentally driven by the need for high throughput and low-latency execution, which is crucial for minimizing the operational cost associated with iterative model inference and retrieval operations.

### **1.2 Foundational Architectural Pillars**

The architecture of the ACE project rests upon three non-negotiable pillars:

1. **Performance:** Achieved through the utilization of Bun’s native speed and highly optimized LLM serving strategies, including specialized hardware acceleration techniques like model quantization and pruning. This ensures that the system can meet stringent latency requirements while maintaining economic viability.  
2. **Consistency (The ACE Focus):** System trustworthiness is guaranteed through two primary methods:  
   * Implementing **Specification Driven Development (SDD)** to formalize expected system behavior prior to implementation.  
   * Employing a **Hybrid Graph/Vector Knowledge Base** to provide structured, relational context, thereby minimizing hallucination and maximizing response Faithfulness.  
3. **Maintainability:** Managed via a **Monorepo structure** (Bun Workspaces) and strict TypeScript governance. A central repository simplifies the management of shared components, internal dependencies, and ensures consistency in application programming interfaces (APIs) across all microservices.

### **1.3 Summary of Key Technology Decisions**

The following matrix summarizes the essential components selected to realize the ACE technical architecture:  
ACE Core Technology Stack

| Component Layer | Primary Technology | Rationale |
| :---- | :---- | :---- |
| Runtime/Framework | Bun (TypeScript) | High-performance, low-latency, unified tooling for monolithic and microservice application I/O. |
| SDLC Methodology | Specification Driven Development (SDD) | Ensures generative output criteria are formally defined and testable against business goals. |
| Knowledge Base | Neo4j (Graph DB) \+ Qdrant/Pinecone (Vector Store) | Hybrid approach to combine semantic retrieval speed with relational data consistency. |
| LLM Inference | Ollama or Custom Bun Server | Optimized, low-latency open-weight model execution and simplified management. |
| CI/CD & Orchestration | GitHub Actions \+ Docker/Kubernetes | Automation, scaling, and zero-downtime deployment capabilities. |
| Consistency Metrics | LLM-as-a-Judge, Golden Dataset | Verification of NFRs like Faithfulness and Answer Accuracy. |

## **Section 2: Software Development Lifecycle (SDLC) and Methodology**

### **2.1 The Case for Specification Driven Development (SDD) in Generative AI**

The ACE project requires the adoption of Specification Driven Development (SDD) as its core methodology, moving beyond traditional Agile/Scrum. Generative AI systems, particularly LLMs, produce probabilistic outputs, making it exceedingly difficult for traditional development processes to adequately define and verify success criteria. SDD addresses this by formalizing the expected behaviors of the AI system. The SDD workflow shifts the focus from merely defining *how* code is written to rigorously defining *what* the system's successful output behavior must achieve.  
This behavioral focus is paramount. Since the SDD methodology forces the articulation of success criteria in natural language, these artifact definitions can be directly translated into the initial input-output pairs necessary for constructing the required "Golden Dataset". This inherent alignment between the SDD specification and the QA requirement streamlines the testing preparation phase significantly, guaranteeing that quality assurance metrics align precisely with defined business intent.

### **2.2 SDD Workflow: Specify, Plan, Task Generation, and Implementation Loop**

The SDD workflow is structured into four distinct, cyclical phases:

1. **Phase 1: Specify:** This phase defines the business requirements and high-level outcomes. It provides a detailed, high-level description of the system's purpose and the user journeys it must support, along with critical success criteria (e.g., "The system must answer questions regarding entity relationships with 100% factual accuracy.") Importantly, this phase intentionally avoids technical stack decisions.  
2. **Phase 2: Plan:** This is the phase where the SDD shifts to technical blueprinting. The architectural pillars (Bun, Graph RAG, Ollama) are selected, and the critical interfaces and component interactions are defined. During this stage, the Non-Functional Requirements (NFRs, detailed in Section 6\) are mapped specifically to the required technical components that will enforce them.  
3. **Phase 3: Tasks:** The specifications and plans are translated into small, actionable, and reviewable work chunks suitable for implementation. For the Graph RAG architecture, these tasks include specific prompt definition tasks, the generation of precise Cypher query templates, and service integration tasks between the Bun microservices and the Neo4j database.  
4. **Phase 4: Implement:** The execution of tasks. This phase is immediately followed by SDD-driven verification (Section 5), focusing on whether the implemented solution meets the structured behavioral output requirements defined in the specification phase.

The structure of SDD compels a strategic departure from measuring code functionality toward evaluating behavioral success. Since the methodology centers on successful *experience* and *output criteria* , the test artifacts produced must measure qualitative aspects such as Faithfulness and Evidence Coverage , rather than simple function return values or exact string matches. This focus elevates the importance of the dedicated AI Evaluation Framework described in Section 5\.

### **2.3 Agile Integration and Iteration Planning**

The SDD framework is integrated into the standard iteration planning cycle (Scrum/Kanban). The "Specify" and "Plan" phases typically map to discovery or spike sprints, generating the detailed specifications and technical definitions that feed the "Tasks" into the main development sprints.  
A key governance principle is treating all AI-specific artifacts—including prompt examples, few-shot demonstrations, and entries in the Golden Dataset—as rigorously version-controlled assets. These assets must be tagged with metadata describing the domain, complexity, and validation date. This version control infrastructure minimizes time spent manually maintaining high-quality training examples and ensures reliable, accurate output delivery.

## **Section 3: Core Technical Architecture and Tool Stack**

### **3.1 Bun Runtime: Performance Rationale, Ecosystem, and Language Standards**

The selection of the Bun runtime is predicated on its ability to deliver extremely high performance and low-latency I/O, providing a significant advantage for microservices that require high concurrency and minimal overhead. Bun acts as a unified platform, serving as the application runtime, bundler, and test runner, simplifying the overall toolchain. Standardization across the codebase is enforced through strict TypeScript utilization throughout the Monorepo, ensuring shared type safety and consistency.

### **3.2 Microservice Breakdown: The ACE Services**

The ACE architecture is decomposed into four specialized microservices, each optimized for its specific operational role:

* **API Gateway (Bun/Hono):** This lightweight service handles all external traffic, managing authentication, rate limiting, and routing requests efficiently to the backend services. Its design focuses exclusively on fast, non-blocking I/O.  
* **Inference/RAG Service (Bun/Ollama Connector):** The core intelligence component. It receives user queries, orchestrates the complex hybrid retrieval process (Graph \+ Vector search), manages context assembly, and submits the final, highly structured prompt to the LLM backend (Ollama). This service must be aggressively optimized to satisfy stringent latency NFRs.  
* **Ingestion Engine (Bun Workers):** A dedicated, asynchronous service responsible for processing unstructured source data (e.g., PDFs, documents). Its primary function is the critical knowledge extraction pipeline: identifying entities and relationships, performing disambiguation, and inserting structured graph data into Neo4j. Since this process is resource-heavy and involves potentially volatile LLM extraction, it is managed by Bun Workers for robust parallelism and fault tolerance.  
* **Evaluation Microservice (Bun/TypeScript):** An isolated container designed exclusively for running LLM-as-a-judge tests, synthetic data generation, and prompt regression checks. Isolating this component is critical for maintaining the high throughput of the main Inference Service, ensuring testing overhead does not impact production latency.

### **3.3 Data Storage Architecture: Hybrid Approach (Vector Store, Knowledge Graph)**

The ACE project utilizes a hybrid data storage strategy to leverage the strengths of both vector and graph technologies:

* **Graph Database (Neo4j):** This is foundational for the project's consistency requirements. Neo4j is utilized to store interconnected data, modeling complex relationships between entities. This structure allows the LLM to transform a natural language query into a precise query language, such as Cypher, used by Neo4j. This relational foundation provides the high-fidelity context required for consistency.  
* **Vector Store (e.g., Qdrant/Pinecone):** Stores vector embeddings of raw document chunks and property attributes. This store is optimized for efficient Approximate Nearest-Neighbor (ANN) retrieval , enabling rapid semantic search capabilities for unstructured data.

#### **Hybrid RAG Strategy**

The hybrid approach ensures reliability. While standard RAG often struggles with "Loss of Context" or "Search Inaccuracies" because isolated vector chunks fail to capture logical dependencies , the knowledge graph mitigates this risk by providing a structured, connected view of data, showing the relationships between concepts, people, and events. Queries first utilize the vector store for broad semantic alignment, followed by leveraging the graph database for specific, high-fidelity relational context extraction. This architecture prioritizes verification metrics such as *Faithfulness* and *Evidence Coverage* over mere initial speed of retrieval.  
Furthermore, aggressive performance optimization is required not only at the LLM level but also at the data retrieval layer. To satisfy stringent latency NFRs (Section 6), relying solely on Bun's speed is insufficient. The retrieval mechanism must leverage Approximate Nearest-Neighbor (ANN) indexes like HNSW in the Vector Store and require constant optimization of Cypher queries in Neo4j. This optimization is mandatory because slow context assembly during the retrieval phase will directly translate into a high-latency response, even if the subsequent LLM inference is fast.

## **Section 4: Open-Weight Model Integration and Inference Management**

### **4.1 Open-Weight Model Selection Criteria**

Model selection for ACE is driven by a balance of performance and economic viability. Primary criteria include model size (specifically, VRAM requirements), the availability of suitable quantization techniques, inference performance (measured in tokens per second), and commercial license viability. The overall goal is to optimize both embedding and generation models using techniques like weight quantization and pruning , which reduces the memory footprint and significantly increases inference speed, directly supporting cost and latency NFRs.

### **4.2 Strategy for Model Serving via Ollama**

The recommended approach is to utilize Ollama as the dedicated, optimized backend for LLM serving. Ollama is a lightweight framework providing an optimized runtime for models (such as LLaMA or Mistral), ensuring efficient GPU/CPU inference. It also simplifies custom model management and provides a clean REST API, making integration seamless for the Bun Inference Service.  
The Bun Inference Service connects directly to the Ollama server via this REST API. This architectural separation is vital: the highly specialized LLM engine runs on optimized hardware (e.g., a dedicated GPU server), while the application logic (the RAG pipeline orchestration) runs on the general-purpose, efficient Bun server. The Ollama integration introduces a deployment dependency that must be carefully managed in the CI/CD pipeline. Ollama must be deployed alongside the Bun Inference Service, ideally within the same Kubernetes pod or as a tightly coupled sidecar, and the CI/CD process must manage the deployment of selected model weights *onto* the Ollama server, separate from the primary Bun Docker image, to prevent image bloat.

### **4.3 Optimizing Inference: Quantization, Pruning, and ANN Indexes**

To meet the aggressive low-latency P95 NFR, stringent optimization techniques are mandatory:

* **Quantization:** Applying 4-bit or 8-bit quantization to the chosen LLM is required to reduce the memory footprint and operational cost while increasing processing speed.  
* **ANN Indexes:** The retrieval performance of the Vector Store must be optimized using Approximate Nearest-Neighbor (ANN) indexes, such as HNSW (Hierarchical Navigable Small Worlds) or IVFPQ. The use of ANN indexes drastically reduces query latency during retrieval steps with minimal loss of overall accuracy.

### **4.4 The Graph RAG Pipeline: Transforming Unstructured Data into Knowledge Graphs**

The ingestion of data for the Graph RAG pipeline involves a complex, multi-step process managed by the asynchronous Ingestion Engine:

1. **Raw Text Ingestion:** Source documents (unstructured data) are loaded into the Bun Ingestion Engine.  
2. **LLM-Driven Extraction:** A specialized LLM (often smaller and fine-tuned for structured output) is prompted to extract key nodes (entities), edges (relationships), and properties from the raw text.  
3. **Entity Disambiguation:** This crucial step ensures the consistency and integrity of the graph. It involves processing extracted entities to identify and merge duplicate or synonymous entities discovered across different source documents.  
4. **Cypher Import:** The structured data, now validated and disambiguated, is imported into the Neo4j database using optimized Cypher commands.

This process is inherently asynchronous, transaction-heavy, and involves managing potential LLM extraction failures. The Ingestion Engine must utilize robust queuing mechanisms and Bun Workers to handle this workload, ensuring that failures in the extraction stage do not compromise the system’s primary consistency NFR.

## **Section 5: Comprehensive Testing and Quality Assurance Framework**

### **5.1 AI-Native QA Philosophy: Moving Beyond Exact Matching**

The fundamental QA principle for the ACE project recognizes that LLM outputs permit a range of acceptable answers, making traditional unit testing methods ineffective. The QA framework must instead focus on evaluating qualitative attributes, such as relevance, output faithfulness to context, and completeness. This necessitates the frequent use of an LLM judge.  
The project requires the creation of a **Golden Dataset**: a version-controlled repository of reference inputs and outputs verified by domain experts. This dataset must cover common user scenarios, edge cases (e.g., long messages, unusual inputs), and adversarial scenarios designed to challenge system boundaries. This dataset is essential for regression testing after any modification to the core RAG components (prompts, models, retrieval strategies).

### **5.2 Retrieval Evaluation Metrics**

Evaluation of the RAG system is separated into retrieval and generation components:

* **Recall@k:** This metric assesses whether the necessary context chunk (the ground truth document fragment) was successfully retrieved within the top 'k' results returned by the vector or graph search.  
* **Relevance Scoring (LLM-Judged):** An independent LLM is used to score the retrieved context for semantic relevance and alignment with the user's search intent, ensuring high-quality input for the generator.

### **5.3 Generation Evaluation Framework (Consistency and Accuracy)**

The evaluation of the generated response is split into fidelity and accuracy metrics:

* **Fidelity Metrics (Reference-Free):** These metrics assess the grounding of the output, critical for verifying the success of the Graph RAG architecture.  
  * **Faithfulness:** The most critical metric for ACE. It evaluates whether every relevant knowledge point in the generated long-form answer is strictly grounded in the *given context* (the retrieved data from Neo4j/Vector Store). A high Faithfulness score indicates the system is successfully mitigating hallucination.  
  * **Evidence Coverage:** Measures the completeness of the answer, verifying whether the response adequately covers all knowledge relevant to the question that was available in the provided context.  
* **Accuracy Metrics (Reference-Based):**  
  * **Answer Accuracy:** Assesses both the semantic similarity and the factual consistency of the system's output against a human-provided reference answer.  
  * **LLM Judges:** A dedicated, robust LLM, often more reliable than the production model, is used to assign scores based on defined non-factual metrics (e.g., neutrality of tone, structural quality).

The comprehensive RAG evaluation plan is summarized below:  
RAG Evaluation and Testing Matrix

| Pipeline Stage | Test Type | Key Metric | Verification Method |
| :---- | :---- | :---- | :---- |
| Retrieval | Relevance/Ranking | Recall@k, Context Precision | Synthetic data generation, manual validation. |
| Generation (Fidelity) | Context Grounding | Faithfulness Score (\>95% Target) | LLM Judges comparing output against retrieved context. |
| Generation (Accuracy) | Output Consistency | Answer Accuracy, Hallucination Rate | Comparison against Golden Dataset via semantic similarity checks. |
| Prompt Updates | Regression Testing | Consistency Score, Token Count vs. Quality | A/B Testing, running against the established Golden Dataset. |

### **5.4 Prompt Engineering and Regression Testing Strategy**

The prompt engineering strategy employs advanced techniques such as **Chain-of-Thought (CoT)** prompting to enhance the AI's reasoning capabilities by forcing it to explain its logic before providing the final answer. This is augmented by using few-shot examples and dynamic context injection to improve factual accuracy.  
For self-correction mechanisms, a critical safeguard must be implemented: if rule-based self-correction is used, the system must **never** allow the model to critique its own draft based on its own flawed output, as this introduces circular reasoning. Instead, the critique must be routed through the independent LLM Evaluation Microservice or verified against the established evaluation set.  
Regression testing must be a mandatory gate: any change to RAG logic, prompts, models, or data chunking strategies must trigger a complete run against the Golden Dataset. A failure in any test case signals a regression and must halt the deployment process. Furthermore, testing must include adversarial scenarios, which are specifically designed to push the model towards known failure modes, such as handling excessively long inputs or non-supported languages.  
The dedication to comprehensive LLM testing serves as a cost optimization mechanism. When running A/B tests on prompt changes, the framework must track both quality metrics (e.g., higher Faithfulness) and token count. Since LLM operational cost is a core NFR , the testing must validate that quality improvements are economically sustainable, especially since quality gains often plateau after one or two critique-revise iterations while costs continue to rise.

## **Section 6: Non-Functional Requirements (NFRs) and Operational Excellence**

### **6.1 Defining NFRs for AI Systems: Consistency, Latency, and Cost**

Non-functional requirements serve as fundamental constraints on the architecture, ensuring the operational robustness and ruggedness of the system. For the ACE project, Consistency (Trustworthiness derived from grounded responses) is treated as a foundational requirement, equal in importance to Performance and Cost control.

### **6.2 Quantified Performance Requirements**

The technical architecture is specifically designed to meet the following quantified NFRs:  
Quantified NFRs for the ACE Project

| NFR Domain | Requirement | Target KPI | Verification Method | Architectural Driver |
| :---- | :---- | :---- | :---- | :---- |
| Performance (Latency) | P95 End-to-End Latency | \< 500 ms (API Response) | Load Testing/Benchmark Testing | Bun runtime, Ollama optimization, HNSW indexing. |
| Scalability (Throughput) | Peak Capacity | 500 RPS sustained (Inference Service) | Horizontal Scaling (K8s) deployment. | Microservice architecture, non-blocking Bun I/O. |
| Consistency (AI Output) | Faithfulness Score | \> 97% against Context | LLM Evaluation Framework. | Graph RAG architecture and SDD specifications. |
| Availability | System Uptime | 99.99% (Four Nines) | Continuous monitoring, DR plan validation. | Redundancy in Neo4j clustering and Ollama inference cluster. |

The aggressive 500ms P95 latency NFR dictates the entire model selection and retrieval mechanism. This budget is tight for a complex, multi-step RAG process (embedding, vector search, graph search, context assembly, and LLM inference). This requirement necessitates the use of highly optimized, smaller-to-medium quantized models and mandates that the retrieval phase (Graph/Vector search) is near-instantaneous (e.g., completing in less than 50ms) to leave sufficient time for inference.

### **6.3 Availability, Scalability, and Disaster Recovery Planning**

**Availability:** The system mandates active-active redundancy for the Bun API Gateway and Inference Service, managed through Kubernetes (K8s) deployments across multiple availability zones. Neo4j must utilize native clustering features to ensure high availability for the knowledge base.  
**Scalability:** The architecture must allow the Inference Service to scale horizontally, independent of the API Gateway. Efficient resource utilization, driven by model quantization , facilitates higher service density per compute node, optimizing vertical scaling potential.  
**Disaster Recovery (DR):** RTO (Recovery Time Objectives) and RPO (Recovery Point Objectives) must be rigorously defined. Given the knowledge dependency, the RPO for the Neo4j knowledge base must target near-zero data loss, requiring robust, asynchronous replication mechanisms.

### **6.4 Cost Management Strategy (Token Consumption and Infrastructure Cost Optimization)**

The operational cost of LLMs is a critical constraint due to the required model size and usage volume. The cost management strategy focuses on three areas:

1. **Token Optimization:** Continuously optimizing prompt length to minimize unnecessary token usage.  
2. **Model Efficiency:** Mandating aggressive quantization and pruning of models to reduce memory and compute requirements.  
3. **Economic Viability Testing:** Utilizing the testing framework (Section 5\) to run A/B tests that balance quality improvement against the associated rise in token count and cost, ensuring the system only deploys performance gains that are economically justifiable.

The inherent speed and memory efficiency of the Bun runtime provide a direct infrastructural advantage, translating into reduced compute costs compared to heavier application runtimes.

## **Section 7: DevOps Pipeline, CI/CD, and Deployment Strategy**

### **7.1 Continuous Integration (CI) Workflow with Bun and GitHub Actions**

The CI workflow is triggered upon every code push to feature branches and pull requests targeting the main branch.  
The workflow steps, defined in a .github/workflows/docker.yml file , are executed using GitHub Actions:

1. **Setup and Install:** Configure the Bun runtime, install dependencies using bun install \--frozen-lockfile, and leverage caching.  
2. **Quality Gates:** Run TypeScript compiler (tsc) and ESLint for type safety and code quality across the Monorepo.  
3. **Build and Test:** Run bun build to compile microservice artifacts and execute bun test for traditional unit and integration tests.  
4. **Docker Build:** Build the Docker image for each independent service (API, Inference, Ingestion).  
5. **LLM Regression Test Run (Gate):** If changes involve RAG logic (prompts, retrieval), the CI process must deploy the newly built Docker image to a temporary staging environment. The critical Golden Dataset tests are executed on this instance. Failure of the regression tests (e.g., breach of the Faithfulness NFR) constitutes a CI failure and halts the pipeline.

The Docker images for the Inference Service require a multi-stage build. While the core Bun application uses a lightweight base image, the Ollama service requires specialized dependencies (e.g., CUDA, GPU drivers) for optimal performance. The final container for the Inference Service must be based on an image that includes these specialized prerequisites.

### **7.2 Continuous Deployment (CD) Strategy**

The target environment for CD is a Kubernetes (K8s) cluster, which is mandatory for meeting the NFRs related to availability and scalability. The CD pipeline is triggered upon a successful merge to the main branch.  
**Deployment Steps:**

1. **Image Management:** Docker images are tagged (e.g., with Git SHA) and pushed to a secure Container Registry. Model weights, however, should not be baked into the image but managed separately (e.g., downloaded during pod initialization or managed as a persistent volume).  
2. **K8s Rollout:** GitHub Actions, configured with necessary SSH access secrets , connects to the K8s cluster and updates deployment manifests (e.g., using Helm).  
3. **Zero-Downtime Update:** Rolling updates are utilized for Bun services. Since RAG deployment involves complex components, a blue/green or canary deployment strategy is preferred for the Inference Service. New code is deployed first, running alongside old instances, before the old instances are gracefully decommissioned.

It is important to maintain two separate deployment pipelines: one for core application code (triggered via GitHub Actions) and a separate, internal pipeline dedicated to the hot deployment of updated RAG data/embeddings (triggered by the Ingestion Engine) to minimize knowledge staleness.

### **7.3 Monitoring and Observability Stack**

A comprehensive observability stack is critical for verifying adherence to NFRs :

* **Metrics (Prometheus/Grafana):** Used to continuously track critical NFRs, including Latency (P50 and P95), Throughput (RPS), and resource utilization (CPU, memory, and VRAM consumption for the Ollama inference cluster).  
* **Tracing (OpenTelemetry):** Essential for distributed tracing of RAG requests across all microservices (API Gateway \\rightarrow Retrieval \\rightarrow Ollama Inference \\rightarrow Response). Tracing is used to precisely identify latency bottlenecks within the complex hybrid retrieval steps.  
* **Logging (ELK Stack):** Centralized collection and analysis of errors, warnings, and a sampled set of successful requests, including the full LLM input prompts and model outputs (ensuring PII sanitation).

Monitoring must extend beyond traditional software metrics to include AI-native NFRs. A lightweight, continuous monitoring loop must sample production responses and execute the Faithfulness metric against them using the Evaluation Microservice, providing ongoing, real-time verification of the Consistency NFR.

## **Section 8: Repository Structure and Environment Management**

### **8.1 Repository Decision: Monorepo Rationale**

The ACE project adopts a **Monorepo structure** utilizing Bun Workspaces.  
**Justification:** The microservices (API, Inference, Ingestion) are tightly coupled and share critical technical assets, including TypeScript interfaces for the Neo4j data model, standardized LLM utility wrappers, and version-controlled prompt templates. A Monorepo drastically simplifies the management of internal dependencies, streamlines code sharing, and enforces consistency across the entire codebase, supporting the foundational consistency pillar of the project.  
The Monorepo structure is organized to facilitate this sharing:  
`/ace-project/`  
`├── node_modules/`   
`├── package.json (Monorepo root configuration)`  
`├── /apps/`  
`│   ├── api-gateway/`   
`│   ├── inference-service/`   
`│   ├── ingestion-engine/`   
`│   ├── evaluation-service/`   
`├── /packages/`  
`│   ├── core-types/ (Shared TypeScript interfaces for all data schemas)`  
`│   ├── rag-utilities/ (Shared embedding/chunking logic)`  
`│   ├── prompt-library/ (Version controlled prompt templates )`  
`├──.github/workflows/ (CI/CD definitions)` 

### **8.2 Defined Environments**

Environment management is crucial for mitigating the testing complexity inherent in LLM and data interactions. Separate, isolated environments are necessary to manage the risk associated with changes to probabilistic systems.  
Environment Management Matrix

| Environment | Purpose | Data Type | LLM Model Type | Role in SDD/QA |
| :---- | :---- | :---- | :---- | :---- |
| Local | Developer Testing, feature isolation. | Synthetic/Truncated | Local Ollama Instance (Small/Medium Model) | Rapid iteration. |
| Development (Dev) | Integration testing, CI verification. | Sanitized/Sampled Production Subset | Staging Inference Server (Quantized Model) | Shared access, primary CI target. |
| Staging (Stg) | Pre-Production NFR Verification. | Full Production Snapshot (Refreshed Daily) | Production-Equivalent Model (Full Weight/Optimized) | Mandatory execution of full Golden Dataset regression suite. |
| Production (Prod) | Live User Traffic, SLA enforcement. | Live/Current Knowledge Graph | Optimized Production Inference Cluster | Must continuously meet all quantified NFRs. |

The isolation of the Staging environment is critical for managing testing integrity. When running regression tests against the Golden Dataset, the retrieved context must be exactly reproducible. Since the production knowledge base is constantly updating, the Staging environment must utilize a versioned snapshot of the knowledge graph data to guarantee reliable and deterministic testing outcomes.  
The environment management also mitigates the risk of circular reasoning during LLM testing. By mandating that Staging and Production utilize separate, isolated LLM Evaluation Microservices, the feedback loop during QA remains independent and verifiable, preventing the LLM from validating its own flawed logic.

### **8.3 Configuration and Secrets Management Strategy**

All sensitive configuration data (e.g., API keys, database credentials, SSH access keys for CD ) must be securely stored outside of the repository. Locally, .env files are used, while production and staging environments rely on robust systems like Kubernetes Secrets or dedicated Vault implementations. GitHub Actions secrets are strictly reserved for managing access credentials to the deployment targets.

## **Section 9: Actionable Implementation Roadmap**

The ACE implementation is organized into four sequential phases, dedicating significant time to the crucial QA and Optimization phase to ensure consistency and performance NFRs are met before large-scale deployment.

### **9.1 Phase 1: Foundation and Specification (Weeks 1-4)**

| Milestone | Deliverables | To-Dos |
| :---- | :---- | :---- |
| **P1.1 SDD Setup** | Defined SDD Specification for first 3 critical user journeys. | Establish Monorepo structure (Bun Workspaces). Define core shared schemas in core-types. |
| **P1.2 Core Stack V1** | Bun API Gateway deployed (Dev environment) and functional. | Implement basic security and routing. Spin up Neo4j and Vector Store (Qdrant) Dev instances. |
| **P1.3 CI/CD V1** | Working GitHub Actions CI pipeline (Lint/Test/Build) established. | Configure initial Dockerfiles. Setup GitHub Secrets for secure Dev environment access. |

### **9.2 Phase 2: RAG Pipeline Development and Inference (Weeks 5-10)**

| Milestone | Deliverables | To-Dos |
| :---- | :---- | :---- |
| **P2.1 Ingestion Engine** | Operational Ingestion Engine microservice, integrated with Bun Workers. | Implement LLM extraction logic (entities/relationships). Finalize Neo4j data model schema based on SDD Plan. |
| **P2.2 Graph RAG V1** | Full RAG pipeline (Query \\rightarrow Graph/Vector Search \\rightarrow LLM) functional in Dev. | Integrate Ollama Inference Server via REST API with the Bun service. Implement hybrid retrieval logic. |
| **P2.3 NFR Baseline** | Baseline performance metrics collected. | Run initial load tests; quantify current P95 Latency and operational cost (token usage). |

### **9.3 Phase 3: QA, Optimization, and Governance (Weeks 11-16)**

This phase is critical for meeting Consistency and Latency NFRs.

| Milestone | Deliverables | To-Dos |
| :---- | :---- | :---- |
| **P3.1 QA Framework** | Evaluation Microservice deployed and integrated. | Define initial Faithfulness and Evidence Coverage metrics. |
| **P3.2 Golden Dataset** | V1 Golden Dataset (50+ cases: common, edge, adversarial) complete. | Collect user interaction data; populate test cases; perform expert verification. |
| **P3.3 Prompt Optimization** | Critical prompt sets optimized using CoT and few-shot techniques. | Integrate prompt library into regression suite. Run A/B tests to optimize token count vs. quality. |
| **P3.4 Inference Optimization** | Models quantized and optimized; ANN indexing deployed. | Apply 4-bit quantization to open-weight models. Enable HNSW indexes in Qdrant; optimize Cypher queries. |

### **9.4 Phase 4: Production Readiness and Hardening (Weeks 17-20)**

| Milestone | Deliverables | To-Dos |
| :---- | :---- | :---- |
| **P4.1 Staging Parity** | Staging environment fully mirrors Production K8s architecture. | Deploy production-grade Neo4j cluster. Verify synchronization methods for knowledge base snapshots. |
| **P4.2 CD Hardening** | Zero-downtime deployment strategy operational (K8s rolling update verified). | Configure monitoring alerts for NFR breaches (Latency P95, Faithfulness Score). |
| **P4.3 NFR Verification** | All quantified NFRs met (P95 \< 500ms, Faithfulness \> 97%). | Final executive sign-off on performance and consistency benchmarks. |
| **P4.4 Go Live** | ACE system ready for controlled production rollout. | Final security audit and compliance check. |

## **Conclusion and Recommendations**

The ACE technical architecture provides a definitive, high-performance blueprint that prioritizes consistency and economic viability. The core architectural decision to implement a Graph RAG hybrid system using Neo4j directly addresses the fundamental limitations of standard RAG by enforcing grounded responses and maximizing factual Faithfulness.  
The adoption of the Bun runtime satisfies the aggressive low-latency NFR targets by providing an extremely efficient host environment, while the use of Ollama and mandated quantization techniques ensures the open-weight LLMs can operate at production speeds and lower operational costs.  
The most critical recommendation is the strict adherence to the SDD methodology and the AI-native testing framework. By dedicating a full phase to the creation of the Golden Dataset and the enforcement of Faithfulness metrics, the project ensures that reliability is built into the system before scaling occurs. The CI/CD pipeline, fortified with the mandatory LLM Regression Test gate, institutionalizes quality assurance, guaranteeing that architectural consistency is preserved across all future deployments.

#### **Works cited**

1\. Are Prompts All You Need? Evaluating Prompt-Based Large Language Models (LLM)s for Software Requirements Classification 1footnote 11footnote 1This preprint has not undergone peer review or any post-submission improvements or corrections. The Version of Record of this article is published in Requiremente Engineering Journal, and is available online at https://doi.org \- arXiv, https://arxiv.org/html/2509.13868v1 2\. The Architect's Guide to Production RAG: Navigating Challenges and Building Scalable AI, https://www.ragie.ai/blog/the-architects-guide-to-production-rag-navigating-challenges-and-building-scalable-ai 3\. Spec Driven Development (SDD): The Evolution Beyond Vibe Coding | by Daniel Sogl, https://danielsogl.medium.com/spec-driven-development-sdd-the-evolution-beyond-vibe-coding-1e431ae7d47b 4\. Understanding Spec-Driven-Development: Kiro, spec-kit, and Tessl \- Martin Fowler, https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html 5\. Build Robust Chatbots with Neo4j, Knowledge Graphs, and LLMs | by Maninder Singh, https://medium.com/@manindersingh120996/build-robust-chatbots-with-neo4j-knowledge-graphs-and-llms-54310a281dd2 6\. How to Convert Unstructured Text to Knowledge Graphs Using LLMs \- Neo4j, https://neo4j.com/blog/developer/unstructured-text-to-knowledge-graph/ 7\. When to use Graphs in RAG: A Comprehensive Analysis for Graph Retrieval-Augmented Generation \- arXiv, https://arxiv.org/html/2506.05690v2 8\. Monorepo vs Polyrepo: The great debate. | by Chris Fryer \- Medium, https://medium.com/@cfryerdev/monorepo-vs-polyrepo-the-great-debate-7b71068e005c 9\. A tutorial on regression testing for LLMs \- Evidently AI, https://www.evidentlyai.com/blog/llm-regression-testing-tutorial 10\. 6 Advanced Prompt Optimization Techniques for Better AI Results | Galileo, https://galileo.ai/blog/advanced-prompt-optimization-techniques-better-ai-results 11\. A complete guide to RAG evaluation: metrics, testing and best practices \- Evidently AI, https://www.evidentlyai.com/llm-guide/rag-evaluation 12\. Build a RAG-Powered LLM Service with Ollama & Open WebUI : A Step-by-Step Guide | by S. Hassan Tabatabaei | Medium, https://medium.com/@hassan.tbt1989/build-a-rag-powered-llm-service-with-ollama-open-webui-a-step-by-step-guide-a688ec58ac97 13\. Local LLM with Ollama, OpenWebUI and Database with RAG \- Reddit, https://www.reddit.com/r/ollama/comments/1kfknqf/local\_llm\_with\_ollama\_openwebui\_and\_database\_with/ 14\. Introduction to NFRs \- Packt, https://www.packtpub.com/en-us/learning/how-to-tutorials/introduction-nfrs 15\. Boost Your CI/CD Pipeline: Automate Docker With GitHub Actions \- The New Stack, https://thenewstack.io/boost-your-ci-cd-pipeline-automate-docker-with-github-actions/ 16\. How to Build a CI/CD Pipeline with GitHub Actions and Docker \- RunCloud, https://runcloud.io/blog/setup-docker-github-actions-ci-cd 17\. RAG in Production: Deployment Strategies & Practical Considerations \- Coralogix, https://coralogix.com/ai-blog/rag-in-production-deployment-strategies-and-practical-considerations/ 18\. Monorepo VS Polyrepo \- DEV Community, https://dev.to/bitdev\_/monorepo-vs-polyrepo-j9