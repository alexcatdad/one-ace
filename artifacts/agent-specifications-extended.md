# ACE Sub-Agent Specifications - Extended Set

**Version**: 1.0.0
**Last Updated**: 2025-11-09
**Status**: Design Phase - Extended Agents

---

## Table of Contents

1. [Prompt Optimization Agent](#1-prompt-optimization-agent)
2. [Performance Profiler Agent](#2-performance-profiler-agent)
3. [Documentation Sync Agent](#3-documentation-sync-agent)
4. [Schema Evolution Agent](#4-schema-evolution-agent)
5. [Agent Orchestration & Coordination](#5-agent-orchestration--coordination)
6. [Complete Agent Ecosystem Overview](#6-complete-agent-ecosystem-overview)

---

## 1. Prompt Optimization Agent

### 1.1. Overview

**Purpose**: Continuously optimize prompts for the optimal balance between quality (Faithfulness ≥ 97%) and token cost through automated A/B testing and LLM-driven refinement.

**Value Proposition**:
- Reduces token costs by 20-40% while maintaining quality
- Automates prompt engineering iterations
- Discovers optimal prompting techniques (CoT, few-shot, etc.)
- Prevents prompt regression
- Maintains prompt version history with performance metrics

**Complexity**: Complex
**Estimated Build Time**: 10-14 days
**Priority**: P2 (High value in Phase 3)
**Phase**: Phase 3 (QA & Optimization)

---

### 1.2. Trigger Mechanisms

| Trigger Type | Event | Frequency | Implementation |
|--------------|-------|-----------|----------------|
| **Scheduled Optimization** | Weekly analysis | Every Sunday 2AM | GitHub Actions cron |
| **Golden Dataset Update** | New test cases added | Per dataset commit | GitHub Actions on path change |
| **Manual A/B Test** | Developer request | On-demand | CLI: `bun agent:optimize-prompt <agent-name>` |
| **Cost Alert** | Token usage spike | Real-time | Prometheus alert triggers agent |
| **Quality Regression** | Faithfulness < 97% | Per evaluation run | Evaluation service webhook |

---

### 1.3. Optimization Strategies

#### Strategy 1: Chain-of-Thought (CoT) Enhancement

**Objective**: Add reasoning steps to improve accuracy

**Algorithm**:
```typescript
async function generateCoTVariant(originalPrompt: string): Promise<string> {
  const cotPrompt = `You are a prompt optimization expert.

TASK: Enhance the following prompt by adding Chain-of-Thought reasoning steps.

ORIGINAL PROMPT:
${originalPrompt}

REQUIREMENTS:
1. Add explicit reasoning steps before the final answer
2. Use phrases like "Let's think step by step"
3. Break down complex tasks into subtasks
4. Maintain the original intent and output format

OUTPUT: Return the enhanced prompt with CoT reasoning.`;

  const enhanced = await llm.complete({
    prompt: cotPrompt,
    temperature: 0.3,
    maxTokens: 2000
  });

  return enhanced.text;
}
```

**Example Transformation**:
```typescript
// BEFORE (Original Narrator Prompt)
const original = `Generate a new faction that opposes The Royal Hegemony.

Context: {context}

Output a JSON object with: name, alignment, core_motivation, leader_name.`;

// AFTER (CoT Enhanced)
const cotEnhanced = `Generate a new faction that opposes The Royal Hegemony.

Context: {context}

Let's approach this step by step:
1. First, analyze The Royal Hegemony's characteristics from the context
2. Then, determine what values would create natural opposition
3. Next, design a faction with contrasting alignment and motivations
4. Finally, create a compelling leader who embodies these opposing values

Based on this reasoning, output a JSON object with: name, alignment, core_motivation, leader_name.`;
```

---

#### Strategy 2: Few-Shot Example Injection

**Objective**: Add demonstration examples to improve output quality

**Algorithm**:
```typescript
async function generateFewShotVariant(
  originalPrompt: string,
  goldenDataset: TestCase[]
): Promise<string> {
  // Select best examples from golden dataset
  const examples = selectDiverseExamples(goldenDataset, {
    count: 3,
    criteria: 'high_faithfulness'  // Only examples with Faithfulness > 98%
  });

  // Format examples
  const exampleText = examples.map((ex, i) => `
Example ${i + 1}:
Input: ${ex.input}
Output: ${ex.expectedOutput}
  `).join('\n');

  // Inject examples into prompt
  const fewShotPrompt = `${originalPrompt}

Here are some examples of high-quality outputs:
${exampleText}

Now, generate your response following the same quality standards:`;

  return fewShotPrompt;
}

function selectDiverseExamples(
  dataset: TestCase[],
  options: { count: number; criteria: string }
): TestCase[] {
  // Filter by criteria
  const highQuality = dataset.filter(tc =>
    tc.metrics.faithfulness > 0.98
  );

  // Ensure diversity (different input types, lengths, complexities)
  const diverse = [];
  const categories = ['simple', 'complex', 'edge_case'];

  for (const category of categories) {
    const categoryExamples = highQuality.filter(tc =>
      tc.metadata.category === category
    );
    if (categoryExamples.length > 0) {
      diverse.push(categoryExamples[0]);
    }
  }

  return diverse.slice(0, options.count);
}
```

---

#### Strategy 3: Token Reduction (Compression)

**Objective**: Reduce prompt length without losing quality

**Algorithm**:
```typescript
async function generateCompressedVariant(originalPrompt: string): Promise<string> {
  const compressionPrompt = `You are a prompt compression expert.

TASK: Compress the following prompt to use fewer tokens while preserving its effectiveness.

ORIGINAL PROMPT (${countTokens(originalPrompt)} tokens):
${originalPrompt}

TECHNIQUES:
- Remove redundant words and phrases
- Use more concise language
- Replace verbose instructions with compact equivalents
- Keep critical constraints and output requirements
- Maintain clarity and precision

TARGET: Reduce by at least 20% while preserving meaning.

OUTPUT: Return the compressed prompt.`;

  const compressed = await llm.complete({
    prompt: compressionPrompt,
    temperature: 0.2,
    maxTokens: 1500
  });

  return compressed.text;
}

function countTokens(text: string): number {
  // Use tiktoken or similar for accurate token counting
  return encode(text).length;
}
```

**Example Transformation**:
```typescript
// BEFORE (356 tokens)
const verbose = `You are an expert world-building assistant specializing in creating deep,
internally consistent lore for role-playing games. Your task is to generate a new faction
that exists within the established world. Please ensure that all generated content is
factually consistent with the provided context and does not contradict any existing lore.
When creating the faction, consider the political landscape, historical events, resource
distribution, and existing power structures. Output your response as a valid JSON object...`;

// AFTER (198 tokens - 44% reduction)
const compressed = `You are a world-building expert. Create a new faction consistent with
the provided context. Consider politics, history, resources, and power structures. Ensure
no contradictions with existing lore. Output as JSON...`;
```

---

#### Strategy 4: Structured Output Optimization

**Objective**: Optimize JSON Schema constraints for better adherence

**Algorithm**:
```typescript
async function optimizeStructuredOutput(
  originalPrompt: string,
  schema: ZodSchema
): Promise<string> {
  // Analyze common validation failures
  const failures = await analyzeSchemaViolations(schema);

  // Generate clarifications for problematic fields
  const clarifications = failures.map(failure => {
    return `- ${failure.field}: ${failure.commonIssue} (use ${failure.correctFormat})`;
  }).join('\n');

  const optimized = `${originalPrompt}

CRITICAL: Your output must strictly adhere to this schema:
${JSON.stringify(schema.shape, null, 2)}

Common mistakes to avoid:
${clarifications}

Ensure every field is present and correctly typed before responding.`;

  return optimized;
}

async function analyzeSchemaViolations(schema: ZodSchema): Promise<Violation[]> {
  // Query evaluation service for recent schema validation failures
  const recentFailures = await evaluationService.getSchemaFailures({
    schema: schema.name,
    limit: 100,
    timeRange: '7d'
  });

  // Aggregate common issues
  const violations = aggregateByField(recentFailures);
  return violations;
}
```

---

### 1.4. A/B Testing Framework

#### Test Setup

```typescript
interface ABTest {
  id: string;
  name: string;
  agent: string;  // 'narrator' | 'historian' | 'consistency-checker'

  variants: {
    control: {
      promptVersion: string;
      prompt: string;
    };
    treatment: {
      promptVersion: string;
      prompt: string;
      strategy: 'cot' | 'few-shot' | 'compressed' | 'structured';
    };
  };

  testCases: string[];  // IDs from golden dataset

  metrics: {
    faithfulness: number;
    evidenceCoverage: number;
    answerAccuracy: number;
    tokenCount: number;
    latency: number;
  };

  sampleSize: number;
  confidence: number;  // e.g., 0.95 for 95% confidence
}
```

#### Test Execution

```typescript
async function runABTest(test: ABTest): Promise<ABTestResult> {
  const results = {
    control: { metrics: [], rawOutputs: [] },
    treatment: { metrics: [], rawOutputs: [] }
  };

  // Load test cases from golden dataset
  const testCases = await loadTestCases(test.testCases);

  // Run control variant
  for (const testCase of testCases) {
    const output = await runInference({
      prompt: test.variants.control.prompt,
      context: testCase.context,
      input: testCase.input
    });

    const metrics = await evaluateOutput({
      output,
      expectedOutput: testCase.expectedOutput,
      context: testCase.context
    });

    results.control.metrics.push(metrics);
    results.control.rawOutputs.push(output);
  }

  // Run treatment variant
  for (const testCase of testCases) {
    const output = await runInference({
      prompt: test.variants.treatment.prompt,
      context: testCase.context,
      input: testCase.input
    });

    const metrics = await evaluateOutput({
      output,
      expectedOutput: testCase.expectedOutput,
      context: testCase.context
    });

    results.treatment.metrics.push(metrics);
    results.treatment.rawOutputs.push(output);
  }

  // Statistical analysis
  const analysis = performStatisticalAnalysis(results);

  return {
    testId: test.id,
    winner: determineWinner(analysis),
    results,
    analysis,
    recommendation: generateRecommendation(analysis)
  };
}
```

#### Statistical Analysis

```typescript
function performStatisticalAnalysis(results: ABTestResults): StatisticalAnalysis {
  const controlMetrics = aggregateMetrics(results.control.metrics);
  const treatmentMetrics = aggregateMetrics(results.treatment.metrics);

  return {
    faithfulness: {
      control: {
        mean: controlMetrics.faithfulness.mean,
        stddev: controlMetrics.faithfulness.stddev,
        ci95: calculateConfidenceInterval(results.control.metrics.map(m => m.faithfulness))
      },
      treatment: {
        mean: treatmentMetrics.faithfulness.mean,
        stddev: treatmentMetrics.faithfulness.stddev,
        ci95: calculateConfidenceInterval(results.treatment.metrics.map(m => m.faithfulness))
      },
      pValue: tTest(
        results.control.metrics.map(m => m.faithfulness),
        results.treatment.metrics.map(m => m.faithfulness)
      ),
      significantImprovement: false  // Set based on p-value < 0.05
    },

    tokenCost: {
      control: {
        mean: controlMetrics.tokenCount.mean,
        total: controlMetrics.tokenCount.sum
      },
      treatment: {
        mean: treatmentMetrics.tokenCount.mean,
        total: treatmentMetrics.tokenCount.sum
      },
      reduction: calculateReduction(
        controlMetrics.tokenCount.mean,
        treatmentMetrics.tokenCount.mean
      ),
      costSavings: calculateCostSavings(
        controlMetrics.tokenCount.sum,
        treatmentMetrics.tokenCount.sum
      )
    },

    recommendation: determineRecommendation({
      qualityImprovement: treatmentMetrics.faithfulness.mean - controlMetrics.faithfulness.mean,
      costReduction: (controlMetrics.tokenCount.mean - treatmentMetrics.tokenCount.mean) / controlMetrics.tokenCount.mean,
      statisticalSignificance: pValue < 0.05
    })
  };
}

function determineRecommendation(analysis: {
  qualityImprovement: number;
  costReduction: number;
  statisticalSignificance: boolean;
}): 'adopt' | 'reject' | 'iterate' {
  // Adopt if: quality maintained/improved AND cost reduced significantly
  if (
    analysis.qualityImprovement >= 0 &&
    analysis.costReduction >= 0.15 &&  // 15%+ cost reduction
    analysis.statisticalSignificance
  ) {
    return 'adopt';
  }

  // Reject if: quality degraded below threshold
  if (analysis.qualityImprovement < -0.02) {  // 2% quality loss
    return 'reject';
  }

  // Iterate if: marginal improvements or no statistical significance
  return 'iterate';
}
```

---

### 1.5. Output Format

#### A/B Test Report

```typescript
interface ABTestReport {
  testId: string;
  testName: string;
  agent: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;

  variants: {
    control: {
      promptVersion: string;
      strategy: string;
    };
    treatment: {
      promptVersion: string;
      strategy: string;
    };
  };

  sampleSize: number;

  results: {
    faithfulness: {
      control: { mean: number; ci95: [number, number] };
      treatment: { mean: number; ci95: [number, number] };
      improvement: number;  // %
      pValue: number;
      significant: boolean;
    };
    tokenCost: {
      control: { mean: number; total: number };
      treatment: { mean: number; total: number };
      reduction: number;  // %
      costSavings: number;  // USD
    };
    latency: {
      control: { p95: number };
      treatment: { p95: number };
      improvement: number;  // %
    };
  };

  winner: 'control' | 'treatment' | 'inconclusive';
  recommendation: 'adopt' | 'reject' | 'iterate';
  reasoning: string;

  nextSteps: string[];
}
```

#### Console Output

```
🎯 Prompt Optimization Agent v1.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 A/B Test: Narrator Agent - CoT Enhancement
   Test ID: ab-test-narrator-cot-001
   Sample Size: 50 test cases from golden dataset

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 RESULTS:

Faithfulness Score:
  Control:   97.2% (±0.8%)
  Treatment: 98.1% (±0.6%) ✅ +0.9%
  p-value:   0.023 (statistically significant)

Token Cost:
  Control:   842 tokens/request
  Treatment: 1,024 tokens/request ❌ +21.6%
  Cost Increase: $0.0037/request

Latency (P95):
  Control:   423ms
  Treatment: 487ms ⚠️  +15.1%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏆 WINNER: Inconclusive

💡 RECOMMENDATION: Iterate

REASONING:
While the treatment variant shows statistically significant
improvement in Faithfulness (+0.9%), it comes at a substantial
cost increase (+21.6% tokens, +15.1% latency). This trade-off
is not economically viable for production use.

NEXT STEPS:
1. Try compressed CoT variant to reduce token overhead
2. Test selective CoT (only for complex queries)
3. Explore abbreviated reasoning steps

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️  Completed in 4m 32s
📄 Full report: artifacts/ab-test-narrator-cot-001.json
```

---

### 1.6. Auto-Deployment Pipeline

```typescript
async function autoDeployWinner(testResult: ABTestResult): Promise<void> {
  if (testResult.recommendation !== 'adopt') {
    logger.info('Test did not produce adoptable winner, skipping deployment');
    return;
  }

  // 1. Create new prompt version
  const newVersion = await createPromptVersion({
    agent: testResult.agent,
    content: testResult.variants.treatment.prompt,
    metadata: {
      strategy: testResult.variants.treatment.strategy,
      abTestId: testResult.testId,
      improvements: {
        faithfulness: testResult.results.faithfulness.improvement,
        costReduction: testResult.results.tokenCost.reduction
      },
      baseVersion: testResult.variants.control.promptVersion
    }
  });

  // 2. Update prompt library
  await commitPromptToLibrary({
    version: newVersion,
    path: `packages/prompt-library/${testResult.agent}-v${newVersion.semver}.txt`
  });

  // 3. Create PR for deployment
  const pr = await createPR({
    title: `[Prompt Optimization] Deploy ${testResult.agent} v${newVersion.semver}`,
    body: generatePRBody(testResult, newVersion),
    labels: ['prompt-optimization', 'auto-generated'],
    files: [`packages/prompt-library/${testResult.agent}-v${newVersion.semver}.txt`]
  });

  logger.info(`Created PR for prompt deployment: ${pr.url}`);
}

function generatePRBody(testResult: ABTestResult, newVersion: PromptVersion): string {
  return `## 🎯 Automated Prompt Optimization

**Agent**: ${testResult.agent}
**Strategy**: ${testResult.variants.treatment.strategy}
**Test ID**: ${testResult.testId}

### Performance Improvements

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Faithfulness** | ${testResult.results.faithfulness.control.mean}% | ${testResult.results.faithfulness.treatment.mean}% | +${testResult.results.faithfulness.improvement}% ✅ |
| **Token Cost** | ${testResult.results.tokenCost.control.mean} | ${testResult.results.tokenCost.treatment.mean} | ${testResult.results.tokenCost.reduction}% 💰 |
| **Latency (P95)** | ${testResult.results.latency.control.p95}ms | ${testResult.results.latency.treatment.p95}ms | ${testResult.results.latency.improvement}% |

### Statistical Validation

- **Sample Size**: ${testResult.sampleSize} test cases
- **Confidence**: 95%
- **p-value**: ${testResult.results.faithfulness.pValue} (${testResult.results.faithfulness.significant ? 'significant' : 'not significant'})

### Cost Impact

- **Cost per Request**: $${testResult.results.tokenCost.costSavings} savings
- **Monthly Savings** (est. 10k requests): $${testResult.results.tokenCost.costSavings * 10000}

### Testing

This optimization was validated against the full golden dataset with ${testResult.sampleSize} diverse test cases including:
- Common scenarios
- Edge cases
- Adversarial inputs

All tests passed with Faithfulness ≥ 97%.

### Deployment Plan

1. Merge this PR to deploy new prompt version
2. Monitor Faithfulness metrics for 48 hours
3. Rollback to v${testResult.variants.control.promptVersion} if regression detected

---

**Auto-generated by Prompt Optimization Agent v1.0.0**
`;
}
```

---

### 1.7. Implementation Structure

```
packages/agents/prompt-optimizer/
├── index.ts                      # Main entry point
├── config.ts                     # Configuration
├── strategies/
│   ├── cot-enhancer.ts          # Chain-of-Thought enhancement
│   ├── few-shot-injector.ts     # Few-shot example generation
│   ├── compressor.ts            # Token reduction
│   └── structured-optimizer.ts  # JSON Schema optimization
├── ab-testing/
│   ├── test-runner.ts           # A/B test execution
│   ├── statistical-analysis.ts  # T-test, confidence intervals
│   └── winner-selector.ts       # Determine optimal variant
├── evaluators/
│   ├── faithfulness-evaluator.ts
│   ├── cost-calculator.ts
│   └── latency-tracker.ts
├── deployment/
│   ├── version-manager.ts       # Prompt versioning
│   ├── library-updater.ts       # Update prompt-library
│   └── pr-creator.ts            # GitHub PR automation
└── tests/
    ├── strategies.test.ts
    └── fixtures/
```

---

## 2. Performance Profiler Agent

### 2.1. Overview

**Purpose**: Continuously monitor system performance, identify bottlenecks, and automatically suggest optimizations to maintain NFRs (P95 < 500ms, Faithfulness ≥ 97%).

**Value Proposition**:
- Proactively detects performance regressions
- Identifies slow Cypher queries and suggests indexes
- Optimizes vector search (HNSW) parameters
- Detects N+1 query patterns
- Suggests caching opportunities
- Maintains latency NFR automatically

**Complexity**: Complex
**Estimated Build Time**: 10-14 days
**Priority**: P2 (High value in Phase 3-4)
**Phase**: Phase 3-4 (Optimization & Production)

---

### 2.2. Trigger Mechanisms

| Trigger Type | Event | Frequency | Implementation |
|--------------|-------|-----------|----------------|
| **NFR Alert** | P95 latency > 500ms | Real-time | Prometheus AlertManager |
| **Scheduled Profiling** | Weekly deep analysis | Every Monday 3AM | GitHub Actions cron |
| **Manual Profiling** | Developer request | On-demand | CLI: `bun agent:profile [--service=inference]` |
| **Pre-Deployment** | Before production deploy | Per staging deployment | GitHub Actions workflow |
| **Continuous Monitoring** | Sample production traffic | Every 5 minutes | Background process |

---

### 2.3. Profiling Strategies

#### Strategy 1: Distributed Trace Analysis

**Objective**: Identify slow operations in LangGraph workflows

**Algorithm**:
```typescript
async function analyzeDistributedTraces(
  timeRange: { start: Date; end: Date }
): Promise<PerformanceInsight[]> {
  // 1. Fetch traces from Jaeger
  const traces = await jaeger.getTraces({
    service: 'inference-service',
    startTime: timeRange.start,
    endTime: timeRange.end,
    minDuration: '400ms',  // Only traces approaching NFR limit
    limit: 1000
  });

  const insights = [];

  // 2. Analyze each trace
  for (const trace of traces) {
    // Build span tree
    const spanTree = buildSpanTree(trace.spans);

    // Find critical path (slowest sequential chain)
    const criticalPath = findCriticalPath(spanTree);

    // Identify bottleneck spans
    const bottlenecks = criticalPath.filter(span =>
      span.duration > trace.duration * 0.3  // Spans taking >30% of total time
    );

    for (const bottleneck of bottlenecks) {
      insights.push({
        type: 'slow-span',
        severity: calculateSeverity(bottleneck.duration, trace.duration),
        service: bottleneck.serviceName,
        operation: bottleneck.operationName,
        duration: bottleneck.duration,
        percentage: (bottleneck.duration / trace.duration) * 100,
        recommendation: generateRecommendation(bottleneck),
        traceId: trace.traceId
      });
    }
  }

  return insights;
}

function findCriticalPath(spanTree: SpanTree): Span[] {
  // DFS to find longest path from root to leaf
  let longestPath: Span[] = [];
  let maxDuration = 0;

  function dfs(node: SpanNode, currentPath: Span[], currentDuration: number) {
    currentPath.push(node.span);
    currentDuration += node.span.duration;

    if (node.children.length === 0) {
      // Leaf node - check if this is the longest path
      if (currentDuration > maxDuration) {
        maxDuration = currentDuration;
        longestPath = [...currentPath];
      }
    } else {
      // Continue DFS on children
      for (const child of node.children) {
        dfs(child, currentPath, currentDuration);
      }
    }

    currentPath.pop();
  }

  dfs(spanTree.root, [], 0);
  return longestPath;
}

function generateRecommendation(span: Span): string {
  if (span.operationName.includes('neo4j.query')) {
    return 'Consider adding indexes to Neo4j or optimizing Cypher query';
  } else if (span.operationName.includes('vector.search')) {
    return 'Tune HNSW parameters (ef_search, M) for better performance';
  } else if (span.operationName.includes('llm.inference')) {
    return 'Consider model quantization or switching to smaller model variant';
  } else if (span.operationName.includes('embed')) {
    return 'Implement embedding cache or use batch embedding API';
  }
  return 'Investigate operation for optimization opportunities';
}
```

---

#### Strategy 2: Neo4j Query Optimization

**Objective**: Identify slow Cypher queries and suggest indexes

**Algorithm**:
```typescript
async function analyzeNeo4jQuery(
  slowQueryThreshold: number = 100  // ms
): Promise<QueryOptimization[]> {
  // 1. Query Neo4j slow query log
  const slowQueries = await neo4j.getSlowQueries({
    minDuration: slowQueryThreshold,
    limit: 100
  });

  const optimizations = [];

  // 2. Analyze each slow query
  for (const query of slowQueries) {
    // Parse Cypher query
    const parsed = parseCypher(query.query);

    // Analyze execution plan
    const plan = await neo4j.explain(query.query);

    // Detect issues
    const issues = [];

    // Check for missing indexes
    if (hasLabelScan(plan)) {
      const label = extractLabelFromScan(plan);
      const property = extractPropertyFromFilter(parsed);

      if (property) {
        issues.push({
          type: 'missing-index',
          severity: 'high',
          message: `Label scan on :${label} with filter on ${property}`,
          suggestion: `CREATE INDEX FOR (n:${label}) ON (n.${property})`
        });
      }
    }

    // Check for Cartesian products
    if (hasCartesianProduct(plan)) {
      issues.push({
        type: 'cartesian-product',
        severity: 'critical',
        message: 'Query produces Cartesian product, exponential complexity',
        suggestion: 'Add WHERE clause to connect patterns or use WITH to break query into steps'
      });
    }

    // Check for relationship scans
    if (hasRelationshipScan(plan)) {
      issues.push({
        type: 'relationship-scan',
        severity: 'medium',
        message: 'Full relationship scan detected',
        suggestion: 'Filter relationships by type or properties earlier in the query'
      });
    }

    if (issues.length > 0) {
      optimizations.push({
        query: query.query,
        avgDuration: query.avgDuration,
        executionCount: query.count,
        issues,
        estimatedImprovement: estimateImprovement(issues),
        autoFixAvailable: canAutoFix(issues)
      });
    }
  }

  return optimizations;
}

function estimateImprovement(issues: Issue[]): string {
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const highIssues = issues.filter(i => i.severity === 'high');

  if (criticalIssues.length > 0) {
    return '10-100x faster (exponential improvement)';
  } else if (highIssues.length > 0) {
    return '3-10x faster (index will help significantly)';
  } else {
    return '1.5-3x faster (moderate improvement)';
  }
}

async function createOptimizationPR(optimization: QueryOptimization): Promise<void> {
  const indexStatements = optimization.issues
    .filter(issue => issue.type === 'missing-index')
    .map(issue => issue.suggestion);

  // Create migration file
  const migrationFile = `
-- Auto-generated by Performance Profiler Agent
-- Query: ${optimization.query.substring(0, 100)}...
-- Current duration: ${optimization.avgDuration}ms
-- Estimated improvement: ${optimization.estimatedImprovement}

${indexStatements.join(';\n')};
  `.trim();

  const timestamp = Date.now();
  const filePath = `migrations/neo4j/V${timestamp}__auto_optimize_queries.cypher`;

  // Create PR
  await createPR({
    title: '[Performance] Add Neo4j indexes for slow queries',
    body: `## 🚀 Automated Query Optimization

**Detected by**: Performance Profiler Agent
**Impact**: ${optimization.estimatedImprovement}

### Slow Queries Optimized

${optimization.issues.map(issue => `
- **Issue**: ${issue.message}
- **Fix**: \`${issue.suggestion}\`
`).join('\n')}

### Performance Impact

- **Current P95**: ${optimization.avgDuration}ms
- **Expected P95**: ${optimization.avgDuration / estimateSpeedupMultiplier(optimization)}ms
- **Execution Count**: ${optimization.executionCount} queries/day

### Testing

Run the following to test in development:
\`\`\`bash
bun run db:migrate
bun run test:performance
\`\`\`

---

**Auto-generated optimization - review carefully before deploying to production**
`,
    files: [{ path: filePath, content: migrationFile }],
    labels: ['performance', 'database', 'auto-generated']
  });
}
```

---

#### Strategy 3: Vector Search Tuning

**Objective**: Optimize HNSW parameters for latency/accuracy trade-off

**Algorithm**:
```typescript
async function tuneVectorSearchParameters(): Promise<HNSWOptimization> {
  // Current parameters
  const currentParams = {
    ef_search: 64,      // Search time accuracy/speed tradeoff
    M: 16,              // Number of bi-directional links
    ef_construction: 200 // Build time accuracy
  };

  // Benchmark current performance
  const baseline = await benchmarkVectorSearch(currentParams);

  // Test parameter variations
  const variations = [
    { ef_search: 32, M: 16, ef_construction: 200 },   // Faster, less accurate
    { ef_search: 128, M: 16, ef_construction: 200 },  // Slower, more accurate
    { ef_search: 64, M: 32, ef_construction: 200 },   // Better recall, slower
    { ef_search: 64, M: 8, ef_construction: 200 }     // Faster, lower recall
  ];

  const results = [];

  for (const params of variations) {
    const result = await benchmarkVectorSearch(params);
    results.push({
      params,
      latency: result.p95Latency,
      recall: result.recall10,  // Recall@10
      score: calculateScore(result, baseline)
    });
  }

  // Find optimal parameters
  const optimal = results.reduce((best, current) =>
    current.score > best.score ? current : best
  );

  return {
    current: currentParams,
    recommended: optimal.params,
    improvement: {
      latency: ((baseline.p95Latency - optimal.latency) / baseline.p95Latency) * 100,
      recall: ((optimal.recall - baseline.recall10) / baseline.recall10) * 100
    }
  };
}

function calculateScore(
  result: BenchmarkResult,
  baseline: BenchmarkResult
): number {
  // Score = weighted combination of latency improvement and recall maintenance
  const latencyImprovement = (baseline.p95Latency - result.p95Latency) / baseline.p95Latency;
  const recallMaintained = result.recall10 >= baseline.recall10 * 0.95; // Must maintain 95% of recall

  if (!recallMaintained) {
    return -1;  // Reject if recall drops too much
  }

  // Prioritize latency improvements that maintain recall
  return latencyImprovement * 100;
}
```

---

#### Strategy 4: N+1 Query Detection

**Objective**: Detect and fix N+1 query patterns

**Algorithm**:
```typescript
async function detectNPlusOneQueries(traces: Trace[]): Promise<NPlusOneIssue[]> {
  const issues = [];

  for (const trace of traces) {
    // Look for patterns where:
    // 1. Initial query fetches N items
    // 2. Followed by N individual queries for related data

    const spans = trace.spans.sort((a, b) => a.startTime - b.startTime);

    for (let i = 0; i < spans.length - 1; i++) {
      const currentSpan = spans[i];

      if (isQuerySpan(currentSpan)) {
        // Check if followed by multiple similar queries
        const subsequentQueries = [];
        let j = i + 1;

        while (
          j < spans.length &&
          isQuerySpan(spans[j]) &&
          areSimilarQueries(currentSpan, spans[j])
        ) {
          subsequentQueries.push(spans[j]);
          j++;
        }

        // N+1 pattern if we have many similar queries
        if (subsequentQueries.length >= 5) {
          issues.push({
            type: 'n-plus-one',
            severity: 'high',
            initialQuery: currentSpan.operationName,
            repeatedQuery: subsequentQueries[0].operationName,
            repetitionCount: subsequentQueries.length,
            totalWastedTime: subsequentQueries.reduce((sum, s) => sum + s.duration, 0),
            location: extractCodeLocation(currentSpan),
            suggestion: generateNPlusOneFix(currentSpan, subsequentQueries[0])
          });
        }
      }
    }
  }

  return issues;
}

function generateNPlusOneFix(initialQuery: Span, repeatedQuery: Span): string {
  if (initialQuery.tags['db.system'] === 'neo4j') {
    return `Use OPTIONAL MATCH or WITH to fetch related data in single query:

MATCH (parent:Entity)
OPTIONAL MATCH (parent)-[:RELATIONSHIP]->(child:ChildEntity)
RETURN parent, collect(child) as children

Instead of fetching parent first, then querying for each child separately.`;
  }

  return 'Implement data loader pattern or batch fetching to combine multiple queries';
}
```

---

### 2.4. Caching Opportunity Detection

```typescript
async function detectCachingOpportunities(
  traces: Trace[]
): Promise<CachingOpportunity[]> {
  // Analyze query patterns over time
  const queryPatterns = new Map<string, QueryPattern>();

  for (const trace of traces) {
    for (const span of trace.spans) {
      if (isQuerySpan(span)) {
        const normalized = normalizeQuery(span.operationName);

        if (!queryPatterns.has(normalized)) {
          queryPatterns.set(normalized, {
            query: normalized,
            executions: [],
            uniqueResults: new Set()
          });
        }

        const pattern = queryPatterns.get(normalized)!;
        pattern.executions.push({
          timestamp: span.startTime,
          duration: span.duration,
          parameters: span.tags['query.parameters']
        });

        // Track result uniqueness (simplified hash of result)
        const resultHash = span.tags['result.hash'];
        if (resultHash) {
          pattern.uniqueResults.add(resultHash);
        }
      }
    }
  }

  // Identify caching opportunities
  const opportunities = [];

  for (const [query, pattern] of queryPatterns) {
    const execCount = pattern.executions.length;
    const uniqueCount = pattern.uniqueResults.size;
    const repetitionRatio = uniqueCount / execCount;

    // High cache hit potential: same query executed many times with few unique results
    if (execCount >= 10 && repetitionRatio < 0.3) {
      const avgDuration = pattern.executions.reduce((sum, e) => sum + e.duration, 0) / execCount;
      const potentialSavings = avgDuration * execCount * (1 - repetitionRatio);

      opportunities.push({
        query,
        executionCount: execCount,
        uniqueResultCount: uniqueCount,
        cacheHitPotential: (1 - repetitionRatio) * 100,  // %
        avgQueryDuration: avgDuration,
        potentialTimeSavings: potentialSavings,
        recommendation: generateCacheRecommendation(query, pattern)
      });
    }
  }

  // Sort by potential savings
  return opportunities.sort((a, b) => b.potentialTimeSavings - a.potentialTimeSavings);
}

function generateCacheRecommendation(query: string, pattern: QueryPattern): string {
  const ttl = calculateOptimalTTL(pattern.executions);

  return `Implement Redis cache for this query:

- **Cache Key**: Hash of query + parameters
- **TTL**: ${ttl} seconds (based on query frequency)
- **Estimated Hit Rate**: ${((1 - pattern.uniqueResults.size / pattern.executions.length) * 100).toFixed(1)}%
- **Cache Library**: Use existing redis-utilities package

Example implementation:
\`\`\`typescript
const cacheKey = hash({ query, params });
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const result = await db.query(query, params);
await redis.setex(cacheKey, ${ttl}, JSON.stringify(result));
return result;
\`\`\``;
}

function calculateOptimalTTL(executions: QueryExecution[]): number {
  // Analyze time between executions
  const intervals = [];
  for (let i = 1; i < executions.length; i++) {
    intervals.push(executions[i].timestamp - executions[i-1].timestamp);
  }

  // Set TTL to median interval (50% of queries will hit cache)
  const median = intervals.sort((a, b) => a - b)[Math.floor(intervals.length / 2)];
  return Math.round(median / 1000);  // Convert to seconds
}
```

---

### 2.5. Performance Report

```typescript
interface PerformanceReport {
  timestamp: string;
  timeRange: { start: string; end: string };

  summary: {
    totalTraces: number;
    slowTraces: number;  // > 400ms
    nfrViolations: number;  // > 500ms
    avgLatency: number;
    p95Latency: number;
    p99Latency: number;
  };

  bottlenecks: Array<{
    type: 'slow-span' | 'n-plus-one' | 'missing-index' | 'inefficient-vector-search';
    severity: 'critical' | 'high' | 'medium' | 'low';
    service: string;
    operation: string;
    impact: string;  // e.g., "30% of total request time"
    recommendation: string;
    autoFixAvailable: boolean;
  }>;

  optimizations: {
    neo4jIndexes: QueryOptimization[];
    vectorSearchTuning: HNSWOptimization;
    cachingOpportunities: CachingOpportunity[];
    nPlusOneIssues: NPlusOneIssue[];
  };

  estimatedImprovements: {
    latencyReduction: number;  // % improvement
    costSavings: number;  // USD/month
    nfrCompliance: number;  // % of requests meeting NFR
  };

  prUrls: string[];  // PRs created for auto-fixes
}
```

---

### 2.6. Implementation Structure

```
packages/agents/performance-profiler/
├── index.ts                        # Main entry point
├── config.ts                       # Configuration
├── collectors/
│   ├── jaeger-collector.ts         # Fetch distributed traces
│   ├── prometheus-collector.ts     # Fetch metrics
│   └── neo4j-logs-collector.ts     # Fetch slow query logs
├── analyzers/
│   ├── trace-analyzer.ts           # Analyze distributed traces
│   ├── query-analyzer.ts           # Analyze Neo4j queries
│   ├── vector-search-analyzer.ts   # Analyze vector searches
│   └── n-plus-one-detector.ts      # Detect N+1 patterns
├── optimizers/
│   ├── index-suggester.ts          # Suggest Neo4j indexes
│   ├── hnsw-tuner.ts               # Tune HNSW parameters
│   └── cache-advisor.ts            # Suggest caching strategies
├── reporters/
│   ├── performance-reporter.ts
│   └── grafana-dashboard-updater.ts
├── deployment/
│   └── pr-creator.ts               # Create optimization PRs
└── tests/
    └── analyzers.test.ts
```

---

## 3. Documentation Sync Agent

### 3.1. Overview

**Purpose**: Automatically keep documentation synchronized with code changes, preventing documentation drift and improving developer experience.

**Value Proposition**:
- Eliminates stale documentation
- Auto-updates API specs when signatures change
- Generates JSDoc comments for undocumented code
- Updates CONTRIBUTING.md with new patterns
- Maintains OpenAPI/MCP specs automatically
- Reduces onboarding friction

**Complexity**: Simple-Moderate
**Estimated Build Time**: 5-7 days
**Priority**: P3 (Nice to have, improves DX)
**Phase**: Phase 2-3

---

### 3.2. Trigger Mechanisms

| Trigger Type | Event | Frequency | Implementation |
|--------------|-------|-----------|----------------|
| **PR Merge** | Code merged to main | Per merge | GitHub Actions |
| **API Change** | Public API modified | Per commit | Git pre-commit hook |
| **Schema Change** | core-types updated | Per schema file change | GitHub Actions on path |
| **Manual Sync** | Developer request | On-demand | CLI: `bun agent:sync-docs` |
| **Weekly Audit** | Comprehensive check | Every Sunday | GitHub Actions cron |

---

### 3.3. Documentation Sync Strategies

#### Strategy 1: API Signature Change Detection

```typescript
async function detectAPIChanges(
  previousCommit: string,
  currentCommit: string
): Promise<APIChange[]> {
  const changes = [];

  // Get changed files
  const changedFiles = await git.diff(previousCommit, currentCommit, {
    filter: ['apps/api-gateway/**/*.ts', 'apps/*/routes/**/*.ts']
  });

  for (const file of changedFiles) {
    // Parse both versions
    const oldAST = await parseTypeScript(file.oldContent);
    const newAST = await parseTypeScript(file.newContent);

    // Extract API endpoints
    const oldEndpoints = extractAPIEndpoints(oldAST);
    const newEndpoints = extractAPIEndpoints(newAST);

    // Compare endpoints
    const endpointChanges = compareEndpoints(oldEndpoints, newEndpoints);

    for (const change of endpointChanges) {
      changes.push({
        type: change.type,  // 'added' | 'removed' | 'modified'
        endpoint: change.endpoint,
        oldSignature: change.oldSignature,
        newSignature: change.newSignature,
        file: file.path,
        affectedDocs: findAffectedDocs(change.endpoint)
      });
    }
  }

  return changes;
}

function compareEndpoints(
  oldEndpoints: Endpoint[],
  newEndpoints: Endpoint[]
): EndpointChange[] {
  const changes = [];

  // Find removed endpoints
  for (const oldEp of oldEndpoints) {
    if (!newEndpoints.find(ep => ep.path === oldEp.path && ep.method === oldEp.method)) {
      changes.push({
        type: 'removed',
        endpoint: `${oldEp.method} ${oldEp.path}`,
        oldSignature: oldEp.signature,
        newSignature: null
      });
    }
  }

  // Find added endpoints
  for (const newEp of newEndpoints) {
    if (!oldEndpoints.find(ep => ep.path === newEp.path && ep.method === newEp.method)) {
      changes.push({
        type: 'added',
        endpoint: `${newEp.method} ${newEp.path}`,
        oldSignature: null,
        newSignature: newEp.signature
      });
    }
  }

  // Find modified endpoints
  for (const newEp of newEndpoints) {
    const oldEp = oldEndpoints.find(ep =>
      ep.path === newEp.path && ep.method === newEp.method
    );

    if (oldEp && !isSignatureEqual(oldEp.signature, newEp.signature)) {
      changes.push({
        type: 'modified',
        endpoint: `${newEp.method} ${newEp.path}`,
        oldSignature: oldEp.signature,
        newSignature: newEp.signature
      });
    }
  }

  return changes;
}
```

---

#### Strategy 2: OpenAPI Spec Auto-Generation

```typescript
async function updateOpenAPISpec(apiChanges: APIChange[]): Promise<void> {
  // Load current OpenAPI spec
  const currentSpec = await loadOpenAPISpec('docs/api/openapi.yaml');

  // Apply changes
  for (const change of apiChanges) {
    if (change.type === 'added') {
      currentSpec.paths[change.newSignature.path] = {
        [change.newSignature.method.toLowerCase()]: generateOpenAPIOperation(change.newSignature)
      };
    } else if (change.type === 'removed') {
      delete currentSpec.paths[change.oldSignature.path][change.oldSignature.method.toLowerCase()];
    } else if (change.type === 'modified') {
      currentSpec.paths[change.newSignature.path][change.newSignature.method.toLowerCase()] =
        generateOpenAPIOperation(change.newSignature);
    }
  }

  // Save updated spec
  await saveOpenAPISpec('docs/api/openapi.yaml', currentSpec);
}

function generateOpenAPIOperation(signature: EndpointSignature): OpenAPIOperation {
  return {
    summary: signature.description || `${signature.method} ${signature.path}`,
    tags: [signature.tags || 'API'],
    parameters: signature.parameters.map(param => ({
      name: param.name,
      in: param.location,  // 'path' | 'query' | 'header'
      required: param.required,
      schema: zodToOpenAPISchema(param.zodSchema)
    })),
    requestBody: signature.requestBody ? {
      required: true,
      content: {
        'application/json': {
          schema: zodToOpenAPISchema(signature.requestBody.zodSchema)
        }
      }
    } : undefined,
    responses: {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: zodToOpenAPISchema(signature.responseSchema)
          }
        }
      },
      '400': {
        description: 'Validation error'
      },
      '401': {
        description: 'Unauthorized'
      },
      '500': {
        description: 'Internal server error'
      }
    }
  };
}

function zodToOpenAPISchema(zodSchema: ZodSchema): OpenAPISchema {
  // Convert Zod schema to OpenAPI schema format
  if (zodSchema instanceof z.ZodString) {
    return { type: 'string' };
  } else if (zodSchema instanceof z.ZodNumber) {
    return { type: 'number' };
  } else if (zodSchema instanceof z.ZodObject) {
    return {
      type: 'object',
      properties: Object.fromEntries(
        Object.entries(zodSchema.shape).map(([key, schema]) => [
          key,
          zodToOpenAPISchema(schema as ZodSchema)
        ])
      ),
      required: Object.keys(zodSchema.shape)
    };
  } else if (zodSchema instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodToOpenAPISchema(zodSchema.element)
    };
  }
  return { type: 'object' };
}
```

---

#### Strategy 3: JSDoc Comment Generation

```typescript
async function generateMissingJSDocs(files: string[]): Promise<JSDocUpdate[]> {
  const updates = [];

  for (const filePath of files) {
    const content = await readFile(filePath);
    const ast = await parseTypeScript(content);

    // Find functions/classes without JSDoc
    const undocumented = findUndocumentedExports(ast);

    for (const item of undocumented) {
      // Generate JSDoc using LLM
      const jsDoc = await generateJSDoc(item);

      updates.push({
        file: filePath,
        line: item.line,
        item: item.name,
        generatedDoc: jsDoc,
        confidence: calculateConfidence(jsDoc, item)
      });
    }
  }

  return updates;
}

async function generateJSDoc(item: CodeItem): Promise<string> {
  const prompt = `Generate a JSDoc comment for this TypeScript ${item.type}:

\`\`\`typescript
${item.code}
\`\`\`

REQUIREMENTS:
- Include description of purpose
- Document all parameters with @param
- Document return type with @returns
- Add @throws if applicable
- Include usage @example if helpful
- Be concise but clear

OUTPUT: Return only the JSDoc comment block.`;

  const response = await llm.complete({
    prompt,
    temperature: 0.3,
    maxTokens: 500
  });

  return response.text.trim();
}

function findUndocumentedExports(ast: AST): CodeItem[] {
  const undocumented = [];

  // Traverse AST
  traverse(ast, {
    FunctionDeclaration(path) {
      if (isExported(path) && !hasJSDoc(path)) {
        undocumented.push({
          type: 'function',
          name: path.node.id.name,
          code: generateCode(path.node),
          line: path.node.loc.start.line,
          parameters: extractParameters(path.node),
          returnType: extractReturnType(path.node)
        });
      }
    },
    ClassDeclaration(path) {
      if (isExported(path) && !hasJSDoc(path)) {
        undocumented.push({
          type: 'class',
          name: path.node.id.name,
          code: generateCode(path.node),
          line: path.node.loc.start.line,
          methods: extractMethods(path.node)
        });
      }
    }
  });

  return undocumented;
}
```

---

#### Strategy 4: MCP Tool Spec Sync

```typescript
async function updateMCPToolSpecs(schemaChanges: SchemaChange[]): Promise<void> {
  // Load current MCP server spec
  const mcpSpec = await loadMCPSpec('docs/mcp/tools.json');

  for (const change of schemaChanges) {
    if (change.affectsMCPTool) {
      const tool = mcpSpec.tools.find(t => t.schema === change.schemaName);

      if (tool) {
        // Update tool input/output schemas
        tool.inputSchema = zodToJSONSchema(change.newSchema);
        tool.description = generateToolDescription(change.newSchema);
        tool.examples = generateToolExamples(change.newSchema);
      }
    }
  }

  // Save updated spec
  await saveMCPSpec('docs/mcp/tools.json', mcpSpec);
}

function zodToJSONSchema(zodSchema: ZodSchema): JSONSchema {
  // Convert Zod to JSON Schema format
  return zodToJsonSchema(zodSchema, {
    target: 'jsonSchema7',
    $refStrategy: 'none'
  });
}

function generateToolDescription(schema: ZodSchema): string {
  // Extract description from Zod schema or generate with LLM
  const schemaDescription = schema.description;
  if (schemaDescription) {
    return schemaDescription;
  }

  // Use LLM to generate description
  return `Tool for working with ${schema.constructor.name}`;
}
```

---

### 3.4. Output Format

#### Documentation Update Report

```typescript
interface DocumentationUpdateReport {
  timestamp: string;
  triggeredBy: string;

  changes: {
    apiChanges: number;
    schemaChanges: number;
    newJSDocs: number;
    updatedSpecs: number;
  };

  updates: Array<{
    type: 'openapi' | 'mcp' | 'jsdoc' | 'contributing';
    file: string;
    changeDescription: string;
    autoApplied: boolean;
  }>;

  warnings: Array<{
    type: string;
    message: string;
    file: string;
  }>;

  prUrl?: string;
}
```

#### Console Output

```
📚 Documentation Sync Agent v1.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Detected Changes:
   - 2 API endpoint modifications
   - 1 Zod schema updated
   - 5 functions missing JSDoc

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Updates Applied:

📄 OpenAPI Spec (docs/api/openapi.yaml)
   ├─ Updated POST /tools/get_faction_context
   └─ Added GET /tools/list_factions

📄 MCP Tools Spec (docs/mcp/tools.json)
   └─ Updated get_faction_context input schema

📝 JSDoc Comments Generated (5 functions)
   ├─ packages/neo4j-utilities/Driver.ts:42
   ├─ packages/neo4j-utilities/Driver.ts:67
   ├─ apps/api-gateway/routes/factions.ts:23
   ├─ apps/api-gateway/routes/factions.ts:45
   └─ apps/inference-service/agents/narrator.ts:78

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Summary:
   ✅ 3 specification files updated
   ✅ 5 JSDoc comments added
   ⚠️  0 warnings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 PR Created: https://github.com/org/repo/pull/123

⏱️  Completed in 2.3s
```

---

### 3.5. Implementation Structure

```
packages/agents/documentation-sync/
├── index.ts                     # Main entry point
├── config.ts                    # Configuration
├── detectors/
│   ├── api-change-detector.ts   # Detect API changes
│   ├── schema-change-detector.ts # Detect schema changes
│   └── undocumented-detector.ts # Find missing docs
├── generators/
│   ├── openapi-generator.ts     # Generate OpenAPI spec
│   ├── mcp-spec-generator.ts    # Generate MCP spec
│   ├── jsdoc-generator.ts       # Generate JSDoc comments
│   └── contributing-updater.ts  # Update CONTRIBUTING.md
├── updaters/
│   ├── spec-updater.ts          # Apply spec updates
│   └── code-updater.ts          # Insert JSDoc comments
├── reporters/
│   └── sync-reporter.ts
└── tests/
    └── detectors.test.ts
```

---

## 4. Schema Evolution Agent

### 4.1. Overview

**Purpose**: Safely manage Neo4j schema evolution, generate migrations, validate data compatibility, and prevent breaking changes in production.

**Value Proposition**:
- Prevents data corruption from schema changes
- Automates migration script generation
- Validates backward compatibility
- Creates rollback procedures automatically
- Manages breaking changes with deprecation paths
- Ensures zero-downtime migrations

**Complexity**: Very Complex
**Estimated Build Time**: 14-21 days
**Priority**: P3 (Important for Phase 4+ when schema evolves)
**Phase**: Phase 4+ (Production & Iteration)

---

### 4.2. Trigger Mechanisms

| Trigger Type | Event | Frequency | Implementation |
|--------------|-------|-----------|----------------|
| **Schema File Change** | core-types schema modified | Per commit | GitHub Actions on path |
| **KG Ontology Update** | docs/kg-schema.md modified | Per commit | GitHub Actions on path |
| **Manual Migration** | Developer request | On-demand | CLI: `bun agent:migrate-schema` |
| **Pre-Deploy Check** | Before staging deployment | Per deploy | GitHub Actions workflow |

---

### 4.3. Schema Change Detection

```typescript
async function detectSchemaChanges(
  oldSchema: KGSchema,
  newSchema: KGSchema
): Promise<SchemaChange[]> {
  const changes = [];

  // Detect node label changes
  const oldLabels = new Set(oldSchema.nodeLabels.map(n => n.name));
  const newLabels = new Set(newSchema.nodeLabels.map(n => n.name));

  // Added labels
  for (const label of newLabels) {
    if (!oldLabels.has(label)) {
      changes.push({
        type: 'node-label-added',
        breaking: false,
        label,
        migration: 'none'  // New labels are safe
      });
    }
  }

  // Removed labels
  for (const label of oldLabels) {
    if (!newLabels.has(label)) {
      changes.push({
        type: 'node-label-removed',
        breaking: true,  // Removing labels can break queries
        label,
        migration: 'deprecate-then-remove',
        warning: `Removing :${label} will break existing queries`
      });
    }
  }

  // Property changes
  for (const newLabel of newSchema.nodeLabels) {
    const oldLabel = oldSchema.nodeLabels.find(l => l.name === newLabel.name);
    if (oldLabel) {
      const propertyChanges = detectPropertyChanges(oldLabel, newLabel);
      changes.push(...propertyChanges);
    }
  }

  // Relationship type changes
  const relationshipChanges = detectRelationshipChanges(oldSchema, newSchema);
  changes.push(...relationshipChanges);

  // Constraint changes
  const constraintChanges = detectConstraintChanges(oldSchema, newSchema);
  changes.push(...constraintChanges);

  return changes;
}

function detectPropertyChanges(
  oldLabel: NodeLabel,
  newLabel: NodeLabel
): SchemaChange[] {
  const changes = [];

  // Check for added properties
  for (const prop of newLabel.properties) {
    const oldProp = oldLabel.properties.find(p => p.name === prop.name);
    if (!oldProp) {
      changes.push({
        type: 'property-added',
        breaking: prop.required,  // Required props are breaking
        label: newLabel.name,
        property: prop.name,
        migration: prop.required ? 'backfill-required' : 'none'
      });
    } else if (oldProp.type !== prop.type) {
      // Type change
      changes.push({
        type: 'property-type-changed',
        breaking: true,
        label: newLabel.name,
        property: prop.name,
        oldType: oldProp.type,
        newType: prop.type,
        migration: 'convert-data'
      });
    } else if (!oldProp.required && prop.required) {
      // Made required
      changes.push({
        type: 'property-made-required',
        breaking: true,
        label: newLabel.name,
        property: prop.name,
        migration: 'backfill-or-default'
      });
    }
  }

  // Check for removed properties
  for (const oldProp of oldLabel.properties) {
    const newProp = newLabel.properties.find(p => p.name === oldProp.name);
    if (!newProp) {
      changes.push({
        type: 'property-removed',
        breaking: true,
        label: newLabel.name,
        property: oldProp.name,
        migration: 'deprecate-then-remove',
        warning: `Removing ${newLabel.name}.${oldProp.name} may break existing queries`
      });
    }
  }

  return changes;
}
```

---

### 4.4. Migration Script Generation

```typescript
async function generateMigrationScript(changes: SchemaChange[]): Promise<Migration> {
  const migration = {
    version: generateMigrationVersion(),
    up: [],
    down: [],
    dataTransforms: [],
    safetyChecks: []
  };

  for (const change of changes) {
    switch (change.type) {
      case 'node-label-added':
        // No migration needed for new labels
        break;

      case 'property-added':
        if (change.migration === 'backfill-required') {
          migration.up.push(`
// Add required property '${change.property}' to :${change.label}
MATCH (n:${change.label})
WHERE n.${change.property} IS NULL
SET n.${change.property} = ${generateDefaultValue(change)}
          `.trim());

          migration.down.push(`
// Remove property '${change.property}' from :${change.label}
MATCH (n:${change.label})
REMOVE n.${change.property}
          `.trim());

          // Safety check: verify all nodes have the property
          migration.safetyChecks.push({
            description: `Verify all :${change.label} nodes have ${change.property}`,
            query: `
MATCH (n:${change.label})
WHERE n.${change.property} IS NULL
RETURN count(n) as missing_count
            `.trim(),
            assertion: 'missing_count = 0'
          });
        }
        break;

      case 'property-type-changed':
        migration.up.push(`
// Convert ${change.label}.${change.property} from ${change.oldType} to ${change.newType}
MATCH (n:${change.label})
WHERE n.${change.property} IS NOT NULL
SET n.${change.property} = ${generateTypeConversion(change)}
        `.trim());

        migration.down.push(`
// Revert ${change.label}.${change.property} from ${change.newType} to ${change.oldType}
MATCH (n:${change.label})
WHERE n.${change.property} IS NOT NULL
SET n.${change.property} = ${generateReverseTypeConversion(change)}
        `.trim());
        break;

      case 'property-removed':
        // Implement deprecation pattern
        migration.up.push(`
// Mark ${change.label}.${change.property} as deprecated
// (Property will be removed in next major version)
// No action needed - property remains but is no longer used
        `.trim());

        migration.down.push(`
// Property ${change.label}.${change.property} restored
// No action needed - property was never removed
        `.trim());
        break;

      case 'relationship-type-added':
        // Create index for new relationship type
        migration.up.push(`
// Add index for new relationship type :${change.relationshipType}
// (Optional but recommended for query performance)
        `.trim());
        break;

      case 'constraint-added':
        migration.up.push(`
// Add constraint: ${change.constraint}
${generateConstraintCypher(change.constraint)}
        `.trim());

        migration.down.push(`
// Drop constraint: ${change.constraint}
DROP CONSTRAINT ${change.constraint.name} IF EXISTS
        `.trim());

        // Safety check: verify constraint can be applied
        migration.safetyChecks.push({
          description: `Verify constraint ${change.constraint.name} is satisfiable`,
          query: generateConstraintValidationQuery(change.constraint),
          assertion: 'violation_count = 0'
        });
        break;
    }
  }

  return migration;
}

function generateDefaultValue(change: SchemaChange): string {
  // Generate appropriate default based on property type
  switch (change.propertyType) {
    case 'string':
      return `'default_${change.property}'`;
    case 'number':
      return '0';
    case 'boolean':
      return 'false';
    case 'array':
      return '[]';
    default:
      return 'null';
  }
}

function generateTypeConversion(change: SchemaChange): string {
  // Generate Cypher expression to convert between types
  if (change.oldType === 'string' && change.newType === 'number') {
    return `toInteger(n.${change.property})`;
  } else if (change.oldType === 'number' && change.newType === 'string') {
    return `toString(n.${change.property})`;
  } else if (change.oldType === 'string' && change.newType === 'array') {
    return `[n.${change.property}]`;
  }
  return `n.${change.property}`;  // No conversion possible
}
```

---

### 4.5. Data Compatibility Validation

```typescript
async function validateDataCompatibility(
  migration: Migration,
  neo4jConnection: Driver
): Promise<ValidationResult> {
  const results = {
    passed: true,
    checks: []
  };

  // Run safety checks
  for (const check of migration.safetyChecks) {
    const result = await neo4jConnection.query(check.query);
    const record = result.records[0];

    // Evaluate assertion
    const assertionPassed = evaluateAssertion(check.assertion, record);

    results.checks.push({
      description: check.description,
      query: check.query,
      assertion: check.assertion,
      result: record.toObject(),
      passed: assertionPassed
    });

    if (!assertionPassed) {
      results.passed = false;
    }
  }

  // Estimate migration impact
  const impact = await estimateMigrationImpact(migration, neo4jConnection);
  results.impact = impact;

  return results;
}

async function estimateMigrationImpact(
  migration: Migration,
  neo4jConnection: Driver
): Promise<MigrationImpact> {
  const impact = {
    affectedNodes: 0,
    affectedRelationships: 0,
    estimatedDuration: 0,
    downtime: 'none',  // 'none' | 'read-only' | 'full'
    riskLevel: 'low'   // 'low' | 'medium' | 'high' | 'critical'
  };

  // Count affected entities
  for (const statement of migration.up) {
    const parsed = parseCypher(statement);

    if (parsed.affectsNodes) {
      const count = await countAffectedNodes(parsed, neo4jConnection);
      impact.affectedNodes += count;
    }

    if (parsed.affectsRelationships) {
      const count = await countAffectedRelationships(parsed, neo4jConnection);
      impact.affectedRelationships += count;
    }
  }

  // Estimate duration (rough estimate: 1000 updates/second)
  const totalUpdates = impact.affectedNodes + impact.affectedRelationships;
  impact.estimatedDuration = totalUpdates / 1000;  // seconds

  // Determine downtime requirement
  if (hasLockingOperations(migration)) {
    impact.downtime = 'full';
    impact.riskLevel = 'high';
  } else if (hasConstraintChanges(migration)) {
    impact.downtime = 'read-only';
    impact.riskLevel = 'medium';
  } else {
    impact.downtime = 'none';
    impact.riskLevel = 'low';
  }

  return impact;
}
```

---

### 4.6. Rollback Generation

```typescript
async function generateRollbackProcedure(migration: Migration): Promise<RollbackProcedure> {
  return {
    version: migration.version,
    description: `Rollback migration ${migration.version}`,

    steps: [
      {
        step: 1,
        description: 'Create backup of affected data',
        command: `
// Export affected nodes before rollback
CALL apoc.export.json.query(
  "MATCH (n) WHERE ... RETURN n",
  "backup-${migration.version}.json",
  {}
)
        `.trim()
      },
      {
        step: 2,
        description: 'Execute rollback Cypher statements',
        statements: migration.down
      },
      {
        step: 3,
        description: 'Verify rollback success',
        validations: migration.safetyChecks.map(check => ({
          description: `Verify: ${check.description}`,
          query: check.query
        }))
      },
      {
        step: 4,
        description: 'Update schema version tracking',
        command: `
MERGE (v:SchemaVersion {current: true})
SET v.version = '${getPreviousVersion(migration.version)}',
    v.rolledBackAt = datetime()
        `.trim()
      }
    ],

    recovery: {
      description: 'If rollback fails, restore from backup',
      command: `
CALL apoc.import.json(
  "backup-${migration.version}.json",
  {}
)
      `.trim()
    }
  };
}
```

---

### 4.7. Output Format

```
🔄 Schema Evolution Agent v1.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Schema Changes Detected:

⚠️  BREAKING CHANGES (2):
   1. Property 'Faction.territory' type changed: string → array
   2. Property 'Event.participants' made required

✅ NON-BREAKING CHANGES (3):
   1. Node label added: :Territory
   2. Relationship added: :CONTROLS_TERRITORY
   3. Property added: Faction.founded_date (optional)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Migration Impact Analysis:

Affected Data:
   - Nodes: 1,247 (Faction nodes)
   - Relationships: 0
   - Estimated Duration: 1.2 seconds
   - Downtime Required: Read-only mode
   - Risk Level: MEDIUM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Safety Checks (3/3 passed):

   ✓ All Faction nodes can backfill 'participants'
   ✓ Territory string format convertible to array
   ✓ No constraint violations after migration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 Generated Files:

   ✅ migrations/V20251109_001__update_faction_schema.cypher
   ✅ migrations/V20251109_001__rollback.cypher
   ✅ docs/migrations/V20251109_001_README.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Next Steps:

   1. Review migration script carefully
   2. Test in development environment:
      bun run db:migrate --env=dev

   3. Deploy to staging:
      bun run db:migrate --env=staging

   4. Monitor for 24 hours

   5. Deploy to production (requires approval)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  IMPORTANT: Breaking changes detected!
    Coordinate with team before deploying.

⏱️  Completed in 3.4s
```

---

### 4.8. Implementation Structure

```
packages/agents/schema-evolution/
├── index.ts                        # Main entry point
├── config.ts                       # Configuration
├── detectors/
│   ├── schema-diff.ts              # Detect schema changes
│   ├── breaking-change-detector.ts # Identify breaking changes
│   └── compatibility-checker.ts    # Check data compatibility
├── generators/
│   ├── migration-generator.ts      # Generate migration scripts
│   ├── rollback-generator.ts       # Generate rollback procedures
│   └── default-value-generator.ts  # Generate default values
├── validators/
│   ├── safety-validator.ts         # Run safety checks
│   ├── impact-analyzer.ts          # Analyze migration impact
│   └── constraint-validator.ts     # Validate constraints
├── executors/
│   ├── migration-executor.ts       # Execute migrations
│   └── rollback-executor.ts        # Execute rollbacks
└── tests/
    ├── migration-generator.test.ts
    └── fixtures/
```

---

## 5. Agent Orchestration & Coordination

### 5.1. Agent Dependency Graph

```typescript
interface AgentDependency {
  agent: string;
  dependsOn: string[];
  triggersAfter?: string[];
}

const agentDependencies: AgentDependency[] = [
  {
    agent: 'architecture-validator',
    dependsOn: [],  // Always runs first
    triggersAfter: []
  },
  {
    agent: 'test-generator',
    dependsOn: ['architecture-validator'],  // Only after code is valid
    triggersAfter: []
  },
  {
    agent: 'documentation-sync',
    dependsOn: ['architecture-validator'],  // After code validation
    triggersAfter: ['test-generator']  // Can run in parallel with tests
  },
  {
    agent: 'schema-evolution',
    dependsOn: ['architecture-validator'],
    triggersAfter: []
  },
  {
    agent: 'dependency-mapper',
    dependsOn: [],  // Independent analysis
    triggersAfter: []
  },
  {
    agent: 'prompt-optimizer',
    dependsOn: ['test-generator'],  // Needs golden dataset
    triggersAfter: []
  },
  {
    agent: 'performance-profiler',
    dependsOn: [],  // Runs against live system
    triggersAfter: []
  }
];
```

---

### 5.2. Agent Orchestrator Service

```typescript
class AgentOrchestrator {
  async orchestrateOnPR(prNumber: number): Promise<OrchestrationResult> {
    const results = {
      agentsRun: [],
      passed: true,
      blockers: []
    };

    // Phase 1: Critical validators (sequential)
    const architectureResult = await this.runAgent('architecture-validator');
    results.agentsRun.push(architectureResult);

    if (!architectureResult.passed) {
      results.passed = false;
      results.blockers.push('Architecture validation failed - fix before proceeding');
      return results;
    }

    // Phase 2: Parallel analysis (independent agents)
    const parallelResults = await Promise.all([
      this.runAgent('dependency-mapper'),
      this.runAgent('documentation-sync'),
      this.runAgent('schema-evolution')
    ]);

    results.agentsRun.push(...parallelResults);

    // Phase 3: Test generation (after architecture is valid)
    const testGenResult = await this.runAgent('test-generator');
    results.agentsRun.push(testGenResult);

    if (!testGenResult.passed) {
      results.passed = false;
      results.blockers.push('Coverage below threshold');
    }

    return results;
  }

  async orchestrateScheduled(schedule: 'daily' | 'weekly'): Promise<void> {
    if (schedule === 'weekly') {
      // Run expensive optimizations
      await this.runAgent('prompt-optimizer');
      await this.runAgent('performance-profiler');
    } else {
      // Daily lightweight checks
      await this.runAgent('architecture-validator');
      await this.runAgent('test-generator');
    }
  }

  private async runAgent(agentName: string): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      const result = await executeAgent(agentName);

      return {
        agent: agentName,
        passed: result.passed,
        duration: Date.now() - startTime,
        summary: result.summary,
        details: result.details
      };
    } catch (error) {
      return {
        agent: agentName,
        passed: false,
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }
}
```

---

## 6. Complete Agent Ecosystem Overview

### 6.1. Agent Matrix

| Agent | Priority | Phase | Build Time | Complexity | Auto-Fix | Creates PRs |
|-------|----------|-------|------------|------------|----------|-------------|
| **Architecture Validator** | P0 | Phase 1 | 5-7 days | Moderate | 50% of rules | No |
| **Test Generator** | P0 | Phase 1-2 | 10-14 days | Complex | N/A | Yes |
| **Dependency Mapper** | P1 | Phase 1-2 | 5-7 days | Moderate | N/A | Yes |
| **Prompt Optimizer** | P2 | Phase 3 | 10-14 days | Complex | N/A | Yes |
| **Performance Profiler** | P2 | Phase 3-4 | 10-14 days | Complex | N/A | Yes |
| **Documentation Sync** | P3 | Phase 2-3 | 5-7 days | Moderate | Yes | Yes |
| **Schema Evolution** | P3 | Phase 4+ | 14-21 days | Very Complex | No | Yes |

### 6.2. Total Implementation Effort

- **Total Build Time**: 60-84 days (12-17 weeks)
- **Recommended Sequence**: P0 agents first, then P1, then P2/P3 as needed
- **Parallel Development**: 2-3 agents can be built concurrently by separate developers

### 6.3. ROI Estimation

| Agent | Time Saved | Cost Saved | Quality Impact |
|-------|------------|------------|----------------|
| **Architecture Validator** | 2-3 hrs/week (code review) | N/A | Prevents tech debt |
| **Test Generator** | 5-10 hrs/week (test writing) | N/A | 85%+ coverage maintained |
| **Dependency Mapper** | N/A | N/A | 30-50% faster CI |
| **Prompt Optimizer** | N/A | 20-40% token cost | Maintains 97% Faithfulness |
| **Performance Profiler** | 3-5 hrs/week (optimization) | Infrastructure savings | Maintains NFRs |
| **Documentation Sync** | 2-4 hrs/week (doc updates) | N/A | Better DX |
| **Schema Evolution** | 4-8 hrs/migration | Prevents downtime | Zero data loss |

---

**End of Extended Agent Specifications**
