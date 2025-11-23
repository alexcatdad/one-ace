import type { Context, Next } from 'hono';

/**
 * ACE Metrics Middleware and Prometheus Exporter
 * Provides HTTP metrics, custom business metrics, and Prometheus-compatible /metrics endpoint
 */

// Metric storage
interface MetricData {
  requestCount: number;
  requestDuration: number[];
  errorCount: number;
  statusCodes: Record<string, number>;
  customMetrics: Map<string, number>;
  histograms: Map<string, number[]>;
  gauges: Map<string, number>;
}

const metrics: MetricData = {
  requestCount: 0,
  requestDuration: [],
  errorCount: 0,
  statusCodes: {},
  customMetrics: new Map(),
  histograms: new Map(),
  gauges: new Map(),
};

// Keep only last 1000 duration samples for percentile calculation
const MAX_DURATION_SAMPLES = 1000;

/**
 * Hono middleware for collecting HTTP metrics
 */
export function metricsMiddleware() {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const path = c.req.path;
    const method = c.req.method;

    try {
      await next();

      const duration = Date.now() - startTime;
      const status = c.res.status;

      // Update metrics
      metrics.requestCount++;
      metrics.requestDuration.push(duration);

      // Keep duration array bounded
      if (metrics.requestDuration.length > MAX_DURATION_SAMPLES) {
        metrics.requestDuration.shift();
      }

      // Track status codes
      const statusKey = `${status}`;
      metrics.statusCodes[statusKey] = (metrics.statusCodes[statusKey] || 0) + 1;

      // Track errors
      if (status >= 400) {
        metrics.errorCount++;
      }

      // Add histogram entry for this endpoint
      const histogramKey = `http_request_duration_${method}_${path.replace(/\//g, '_')}`;
      if (!metrics.histograms.has(histogramKey)) {
        metrics.histograms.set(histogramKey, []);
      }
      const histogram = metrics.histograms.get(histogramKey);
      if (histogram) {
        histogram.push(duration);
        if (histogram.length > MAX_DURATION_SAMPLES) {
          histogram.shift();
        }
      }
    } catch (error) {
      metrics.errorCount++;
      throw error;
    }
  };
}

/**
 * Increment a custom counter metric
 */
export function incrementCounter(name: string, value = 1): void {
  const current = metrics.customMetrics.get(name) || 0;
  metrics.customMetrics.set(name, current + value);
}

/**
 * Set a gauge metric value
 */
export function setGauge(name: string, value: number): void {
  metrics.gauges.set(name, value);
}

/**
 * Record a histogram observation
 */
export function observeHistogram(name: string, value: number): void {
  if (!metrics.histograms.has(name)) {
    metrics.histograms.set(name, []);
  }
  const histogram = metrics.histograms.get(name);
  if (histogram) {
    histogram.push(value);
    if (histogram.length > MAX_DURATION_SAMPLES) {
      histogram.shift();
    }
  }
}

/**
 * Calculate percentile from sorted array
 */
function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)] ?? 0;
}

/**
 * Generate Prometheus-compatible metrics output
 */
export function generatePrometheusMetrics(serviceName: string): string {
  const lines: string[] = [];
  const prefix = `ace_${serviceName.replace(/-/g, '_')}`;

  // Request count
  lines.push(`# HELP ${prefix}_http_requests_total Total HTTP requests`);
  lines.push(`# TYPE ${prefix}_http_requests_total counter`);
  lines.push(`${prefix}_http_requests_total ${metrics.requestCount}`);

  // Error count
  lines.push(`# HELP ${prefix}_http_errors_total Total HTTP errors`);
  lines.push(`# TYPE ${prefix}_http_errors_total counter`);
  lines.push(`${prefix}_http_errors_total ${metrics.errorCount}`);

  // Request duration histogram buckets
  const buckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
  lines.push(`# HELP ${prefix}_http_request_duration_seconds HTTP request duration`);
  lines.push(`# TYPE ${prefix}_http_request_duration_seconds histogram`);

  for (const bucket of buckets) {
    const count = metrics.requestDuration.filter((d) => d / 1000 <= bucket).length;
    lines.push(`${prefix}_http_request_duration_seconds_bucket{le="${bucket}"} ${count}`);
  }
  lines.push(
    `${prefix}_http_request_duration_seconds_bucket{le="+Inf"} ${metrics.requestDuration.length}`,
  );
  lines.push(
    `${prefix}_http_request_duration_seconds_sum ${metrics.requestDuration.reduce((a, b) => a + b, 0) / 1000}`,
  );
  lines.push(`${prefix}_http_request_duration_seconds_count ${metrics.requestDuration.length}`);

  // Percentiles as gauges (for easier querying)
  lines.push(`# HELP ${prefix}_http_request_duration_p50_seconds P50 request duration`);
  lines.push(`# TYPE ${prefix}_http_request_duration_p50_seconds gauge`);
  lines.push(
    `${prefix}_http_request_duration_p50_seconds ${percentile(metrics.requestDuration, 50) / 1000}`,
  );

  lines.push(`# HELP ${prefix}_http_request_duration_p95_seconds P95 request duration`);
  lines.push(`# TYPE ${prefix}_http_request_duration_p95_seconds gauge`);
  lines.push(
    `${prefix}_http_request_duration_p95_seconds ${percentile(metrics.requestDuration, 95) / 1000}`,
  );

  lines.push(`# HELP ${prefix}_http_request_duration_p99_seconds P99 request duration`);
  lines.push(`# TYPE ${prefix}_http_request_duration_p99_seconds gauge`);
  lines.push(
    `${prefix}_http_request_duration_p99_seconds ${percentile(metrics.requestDuration, 99) / 1000}`,
  );

  // Status codes
  lines.push(`# HELP ${prefix}_http_responses_total HTTP responses by status code`);
  lines.push(`# TYPE ${prefix}_http_responses_total counter`);
  for (const [status, count] of Object.entries(metrics.statusCodes)) {
    lines.push(`${prefix}_http_responses_total{status="${status}"} ${count}`);
  }

  // Custom counters
  for (const [name, value] of metrics.customMetrics) {
    const metricName = `${prefix}_${name.replace(/-/g, '_')}`;
    lines.push(`# HELP ${metricName} Custom metric`);
    lines.push(`# TYPE ${metricName} counter`);
    lines.push(`${metricName} ${value}`);
  }

  // Gauges
  for (const [name, value] of metrics.gauges) {
    const metricName = `${prefix}_${name.replace(/-/g, '_')}`;
    lines.push(`# HELP ${metricName} Custom gauge`);
    lines.push(`# TYPE ${metricName} gauge`);
    lines.push(`${metricName} ${value}`);
  }

  // Custom histograms
  for (const [name, values] of metrics.histograms) {
    if (name.startsWith('http_request_duration_')) continue; // Skip HTTP histograms already handled

    const metricName = `${prefix}_${name.replace(/-/g, '_')}`;
    lines.push(`# HELP ${metricName} Custom histogram`);
    lines.push(`# TYPE ${metricName} histogram`);

    for (const bucket of buckets) {
      const count = values.filter((v) => v <= bucket).length;
      lines.push(`${metricName}_bucket{le="${bucket}"} ${count}`);
    }
    lines.push(`${metricName}_bucket{le="+Inf"} ${values.length}`);
    lines.push(`${metricName}_sum ${values.reduce((a, b) => a + b, 0)}`);
    lines.push(`${metricName}_count ${values.length}`);
  }

  return lines.join('\n');
}

/**
 * Create /metrics endpoint handler for Hono
 */
export function createMetricsHandler(serviceName: string) {
  return (c: Context) => {
    const metricsOutput = generatePrometheusMetrics(serviceName);
    return c.text(metricsOutput, 200, {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
    });
  };
}

/**
 * Get current metrics summary (for health checks / debugging)
 */
export function getMetricsSummary(): {
  requestCount: number;
  errorCount: number;
  errorRate: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
} {
  const requestCount = metrics.requestCount;
  const errorCount = metrics.errorCount;
  const errorRate = requestCount > 0 ? errorCount / requestCount : 0;

  return {
    requestCount,
    errorCount,
    errorRate,
    p50Latency: percentile(metrics.requestDuration, 50),
    p95Latency: percentile(metrics.requestDuration, 95),
    p99Latency: percentile(metrics.requestDuration, 99),
  };
}

/**
 * Reset all metrics (useful for testing)
 */
export function resetMetrics(): void {
  metrics.requestCount = 0;
  metrics.errorCount = 0;
  metrics.requestDuration = [];
  metrics.statusCodes = {};
  metrics.customMetrics.clear();
  metrics.histograms.clear();
  metrics.gauges.clear();
}

// ACE-specific metric helpers
export const aceMetrics = {
  // Evaluation metrics
  recordFaithfulnessScore: (score: number) => {
    setGauge('evaluation_faithfulness_score', score);
    observeHistogram('evaluation_faithfulness_scores', score);
  },

  recordEvidenceCoverageScore: (score: number) => {
    setGauge('evaluation_evidence_coverage_score', score);
    observeHistogram('evaluation_evidence_coverage_scores', score);
  },

  incrementEvaluationCount: (passed: boolean) => {
    incrementCounter('evaluation_total');
    if (passed) {
      incrementCounter('evaluation_passed');
    } else {
      incrementCounter('evaluation_failed');
    }
  },

  // Agent metrics
  recordAgentExecution: (agentName: string, durationMs: number, success: boolean) => {
    observeHistogram(`agent_${agentName}_duration_seconds`, durationMs / 1000);
    incrementCounter(`agent_${agentName}_executions_total`);
    if (!success) {
      incrementCounter(`agent_${agentName}_failures_total`);
    }
  },

  recordValidationIteration: (iterations: number, maxReached: boolean) => {
    observeHistogram('validation_iterations', iterations);
    if (maxReached) {
      incrementCounter('validation_max_iterations_reached_total');
    }
  },

  // Database metrics
  recordNeo4jQuery: (durationMs: number, success: boolean) => {
    observeHistogram('neo4j_query_duration_seconds', durationMs / 1000);
    incrementCounter('neo4j_queries_total');
    if (!success) {
      incrementCounter('neo4j_query_errors_total');
    }
  },

  recordQdrantSearch: (durationMs: number, resultsCount: number) => {
    observeHistogram('qdrant_search_duration_seconds', durationMs / 1000);
    incrementCounter('qdrant_searches_total');
    setGauge('qdrant_last_results_count', resultsCount);
  },

  // LLM metrics
  recordLLMInference: (model: string, durationMs: number, tokensGenerated: number) => {
    observeHistogram('llm_inference_duration_seconds', durationMs / 1000);
    incrementCounter('llm_inferences_total');
    incrementCounter('llm_tokens_generated_total', tokensGenerated);
    if (durationMs > 0) {
      setGauge('llm_tokens_per_second', (tokensGenerated / durationMs) * 1000);
    }
  },

  // Workflow metrics
  recordWorkflowExecution: (durationMs: number, success: boolean) => {
    observeHistogram('workflow_duration_seconds', durationMs / 1000);
    incrementCounter('workflow_executions_total');
    if (!success) {
      incrementCounter('workflow_failures_total');
    }
  },
};
