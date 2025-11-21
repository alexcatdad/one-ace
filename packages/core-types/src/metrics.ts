import { z } from 'zod';

/**
 * Performance Metrics and Monitoring Types
 * Based on specs/architecture_blueprint.md Section 6 (NFRs)
 * Target: P95 latency < 500ms, Throughput > 500 RPS
 */

// Latency Metrics
export const LatencyMetricsSchema = z.object({
  operation: z.string(),
  startTime: z.number(),
  endTime: z.number(),
  durationMs: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

export type LatencyMetrics = z.infer<typeof LatencyMetricsSchema>;

// Service Performance Metrics
export const ServiceMetricsSchema = z.object({
  service: z.string(),
  timestamp: z.string(),
  requestCount: z.number(),
  errorCount: z.number(),
  latency: z.object({
    p50: z.number(),
    p90: z.number(),
    p95: z.number(),
    p99: z.number(),
    mean: z.number(),
    min: z.number(),
    max: z.number(),
  }),
  throughput: z.object({
    rps: z.number(), // Requests per second
    windowSizeMs: z.number(),
  }),
});

export type ServiceMetrics = z.infer<typeof ServiceMetricsSchema>;

// Agent Performance Metrics
export const AgentMetricsSchema = z.object({
  agentName: z.enum(['historian', 'narrator', 'consistency-checker']),
  executionTimeMs: z.number(),
  tokensGenerated: z.number().optional(),
  retrievedEntities: z.number().optional(),
  validationAttempts: z.number().optional(),
  success: z.boolean(),
  timestamp: z.string(),
});

export type AgentMetrics = z.infer<typeof AgentMetricsSchema>;

// Neo4j Query Performance
export const Neo4jQueryMetricsSchema = z.object({
  query: z.string(),
  parameters: z.record(z.unknown()),
  executionTimeMs: z.number(),
  recordsReturned: z.number(),
  timestamp: z.string(),
  success: z.boolean(),
});

export type Neo4jQueryMetrics = z.infer<typeof Neo4jQueryMetricsSchema>;

// Qdrant Vector Search Performance
export const VectorSearchMetricsSchema = z.object({
  query: z.string(),
  embeddingTimeMs: z.number(),
  searchTimeMs: z.number(),
  totalTimeMs: z.number(),
  resultsCount: z.number(),
  scoreThreshold: z.number(),
  timestamp: z.string(),
});

export type VectorSearchMetrics = z.infer<typeof VectorSearchMetricsSchema>;

// Ollama LLM Performance
export const LLMMetricsSchema = z.object({
  model: z.string(),
  operation: z.enum(['chat', 'embedding']),
  promptTokens: z.number().optional(),
  completionTokens: z.number().optional(),
  totalTokens: z.number().optional(),
  executionTimeMs: z.number(),
  tokensPerSecond: z.number().optional(),
  timestamp: z.string(),
  success: z.boolean(),
});

export type LLMMetrics = z.infer<typeof LLMMetricsSchema>;

// Comprehensive Workflow Metrics
export const WorkflowMetricsSchema = z.object({
  sessionId: z.string(),
  query: z.string(),
  totalTimeMs: z.number(),
  agents: z.object({
    historian: AgentMetricsSchema,
    narrator: AgentMetricsSchema,
    consistencyChecker: AgentMetricsSchema,
  }),
  iterations: z.number(),
  finalValidation: z.object({
    passed: z.boolean(),
    faithfulnessScore: z.number(),
    consistencyScore: z.number(),
  }),
  timestamp: z.string(),
});

export type WorkflowMetrics = z.infer<typeof WorkflowMetricsSchema>;

// Percentile Calculator Helper
export function calculatePercentiles(values: number[]): {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  mean: number;
  min: number;
  max: number;
} {
  if (values.length === 0) {
    return { p50: 0, p90: 0, p95: 0, p99: 0, mean: 0, min: 0, max: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const len = sorted.length;

  const percentile = (p: number) => {
    const index = Math.ceil((p / 100) * len) - 1;
    return sorted[Math.max(0, index)] ?? 0;
  };

  return {
    p50: percentile(50),
    p90: percentile(90),
    p95: percentile(95),
    p99: percentile(99),
    mean: values.reduce((sum, v) => sum + v, 0) / len,
    min: sorted[0] ?? 0,
    max: sorted[len - 1] ?? 0,
  };
}

// Performance Tracker Class
export class PerformanceTracker {
  private metrics: LatencyMetrics[] = [];
  private startTimes: Map<string, number> = new Map();

  start(operation: string): void {
    this.startTimes.set(operation, Date.now());
  }

  end(operation: string, metadata?: Record<string, unknown>): LatencyMetrics {
    const endTime = Date.now();
    const startTime = this.startTimes.get(operation) || endTime;
    const durationMs = endTime - startTime;

    const metric: LatencyMetrics = {
      operation,
      startTime,
      endTime,
      durationMs,
      metadata,
    };

    this.metrics.push(metric);
    this.startTimes.delete(operation);

    return metric;
  }

  getMetrics(): LatencyMetrics[] {
    return [...this.metrics];
  }

  clear(): void {
    this.metrics = [];
    this.startTimes.clear();
  }

  getStatistics(): {
    operations: Record<string, ReturnType<typeof calculatePercentiles>>;
  } {
    const byOperation = new Map<string, number[]>();

    for (const metric of this.metrics) {
      const durations = byOperation.get(metric.operation) || [];
      durations.push(metric.durationMs);
      byOperation.set(metric.operation, durations);
    }

    const operations: Record<string, ReturnType<typeof calculatePercentiles>> = {};
    for (const [operation, durations] of byOperation.entries()) {
      operations[operation] = calculatePercentiles(durations);
    }

    return { operations };
  }
}
