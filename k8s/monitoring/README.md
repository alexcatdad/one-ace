# ACE Monitoring & Observability Stack

This directory contains Kubernetes manifests for deploying a production-grade monitoring and observability stack for the ACE platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ACE Services                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ API Gateway │ │  Inference  │ │  Ingestion  │ │ Evaluation  │           │
│  │   /metrics  │ │   /metrics  │ │   /metrics  │ │   /metrics  │           │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘           │
└─────────┼───────────────┼───────────────┼───────────────┼───────────────────┘
          │               │               │               │
          │   Metrics     │   Traces      │               │
          ▼               ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     OpenTelemetry Collector                                  │
│            (Central telemetry aggregation & routing)                         │
└────────────────────────────┬────────────────────┬───────────────────────────┘
                             │                    │
              Metrics        │                    │     Traces
                             ▼                    ▼
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│           Prometheus            │  │            Jaeger               │
│   (Time-series metrics store)   │  │     (Distributed tracing)       │
└─────────────────┬───────────────┘  └─────────────────────────────────┘
                  │
                  │ Query
                  ▼
┌─────────────────────────────────┐
│            Grafana              │
│    (Dashboards & Alerting)      │
└─────────────────────────────────┘
```

## Components

### 1. Prometheus
- **Purpose**: Time-series metrics collection and storage
- **Features**:
  - Auto-discovery of ACE services
  - 30-day retention
  - Alert rule evaluation
  - PromQL query support
- **Port**: 9090
- **Storage**: 50Gi PVC

### 2. Grafana
- **Purpose**: Visualization and dashboards
- **Features**:
  - Pre-configured ACE Overview dashboard
  - Prometheus data source
  - Jaeger data source
  - Authentication enabled (admin/aceadmin)
- **Port**: 3000
- **Storage**: 10Gi PVC

### 3. Jaeger
- **Purpose**: Distributed tracing
- **Features**:
  - OpenTelemetry Protocol (OTLP) support
  - Badger storage backend
  - Trace visualization
  - Service dependency maps
- **Ports**: 16686 (Query), 4317 (OTLP gRPC), 4318 (OTLP HTTP)
- **Storage**: 20Gi PVC

### 4. OpenTelemetry Collector
- **Purpose**: Centralized telemetry processing
- **Features**:
  - Receives traces via OTLP
  - Exports to Jaeger and Prometheus
  - Resource attribute injection
  - Batch processing
- **Ports**: 4317 (gRPC), 4318 (HTTP), 8889 (Prometheus exporter)

## Alert Rules

### SLA Alerts (Critical)

| Alert | Condition | Duration | Description |
|-------|-----------|----------|-------------|
| HighLatencyP95 | P95 > 500ms | 5min | Latency NFR breach |
| LowFaithfulnessScore | Avg < 97% | 10min | Quality NFR breach |
| ServiceDown | up == 0 | 1min | Service unavailable |

### Performance Alerts (Warning)

| Alert | Condition | Duration | Description |
|-------|-----------|----------|-------------|
| HighErrorRate | >5% errors | 5min | Elevated error rate |
| LowThroughput | <100 RPS | 10min | Low request rate |
| HighMemoryUsage | >90% | 5min | Memory pressure |
| HighCPUUsage | >80% | 10min | CPU pressure |
| SlowLLMInference | P95 > 30s | 5min | Slow model inference |

### Database Alerts (Warning)

| Alert | Condition | Duration | Description |
|-------|-----------|----------|-------------|
| Neo4jConnectionFailure | Errors > 0 | 2min | Database connection issues |
| SlowNeo4jQueries | P95 > 1s | 5min | Slow graph queries |
| SlowVectorSearch | P95 > 500ms | 5min | Slow Qdrant searches |

### Agent Alerts (Warning)

| Alert | Condition | Duration | Description |
|-------|-----------|----------|-------------|
| HighAgentFailureRate | >10% failures | 5min | Agent execution issues |
| ValidationLoopExhausted | Max iterations hit | 5min | Consistency problems |
| ConsistencyCheckFailures | >20% failures | 10min | Validation issues |

## Pre-configured Dashboards

### ACE Overview Dashboard
- **Request Rate (RPS)**: Current throughput
- **P95 Latency**: Response time with threshold
- **Faithfulness Score**: Quality metric with threshold
- **Error Rate**: Error percentage with threshold
- **Latency by Service**: Time-series chart
- **Request Rate by Service**: Time-series chart

### Additional Dashboards (Coming Soon)
- Agent Performance Dashboard
- Database Performance Dashboard
- LLM Inference Dashboard
- Evaluation Dashboard

## Deployment

### Prerequisites

1. **Kubernetes cluster** with monitoring namespace support
2. **ACE services deployed** with metrics endpoints
3. **Storage class** for persistent volumes

### Deploy Monitoring Stack

```bash
# Create monitoring namespace
kubectl apply -f prometheus.yaml

# Deploy alerting rules
kubectl apply -f alerting-rules.yaml

# Deploy Grafana
kubectl apply -f grafana.yaml

# Deploy Jaeger
kubectl apply -f jaeger.yaml

# Deploy OpenTelemetry Collector
kubectl apply -f otel-collector.yaml

# Verify deployments
kubectl get pods -n monitoring
```

### Expected Output

```
NAME                              READY   STATUS    RESTARTS   AGE
grafana-xxx                       1/1     Running   0          1m
jaeger-xxx                        1/1     Running   0          1m
otel-collector-xxx                1/1     Running   0          1m
prometheus-xxx                    1/1     Running   0          1m
```

### Access Dashboards

```bash
# Port forward Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000

# Port forward Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090

# Port forward Jaeger
kubectl port-forward -n monitoring svc/jaeger-query 16686:16686
```

- **Grafana**: http://localhost:3000 (admin/aceadmin)
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686

## Integrating ACE Services

### Add Metrics Middleware

```typescript
import { metricsMiddleware, createMetricsHandler } from '@ace/metrics';

const app = new Hono();

// Add metrics middleware (must be first)
app.use('*', metricsMiddleware());

// Add metrics endpoint
app.get('/metrics', createMetricsHandler('api-gateway'));
```

### Record Custom Metrics

```typescript
import { aceMetrics } from '@ace/metrics';

// Record faithfulness score
aceMetrics.recordFaithfulnessScore(0.98);

// Record agent execution
aceMetrics.recordAgentExecution('historian', 150, true);

// Record LLM inference
aceMetrics.recordLLMInference('llama3.2:3b', 2500, 150);

// Record workflow
aceMetrics.recordWorkflowExecution(5000, true);
```

### Add OpenTelemetry Tracing

```typescript
import { trace, context } from '@opentelemetry/api';

const tracer = trace.getTracer('ace-api-gateway');

async function handleRequest() {
  const span = tracer.startSpan('handle-request');
  try {
    // Your code here
    span.setAttributes({
      'http.method': 'POST',
      'http.route': '/workflow/run',
    });
  } finally {
    span.end();
  }
}
```

## Prometheus Queries

### Latency Percentiles

```promql
# P50 latency
histogram_quantile(0.50, sum(rate(ace_api_gateway_http_request_duration_seconds_bucket[5m])) by (le))

# P95 latency
histogram_quantile(0.95, sum(rate(ace_api_gateway_http_request_duration_seconds_bucket[5m])) by (le))

# P99 latency
histogram_quantile(0.99, sum(rate(ace_api_gateway_http_request_duration_seconds_bucket[5m])) by (le))
```

### Throughput

```promql
# Requests per second (all services)
sum(rate(ace_api_gateway_http_requests_total[5m]))

# Requests per second (by service)
sum(rate(ace_api_gateway_http_requests_total[5m])) by (job)
```

### Error Rate

```promql
# Error rate percentage
sum(rate(ace_api_gateway_http_errors_total[5m])) / sum(rate(ace_api_gateway_http_requests_total[5m])) * 100
```

### Faithfulness Score

```promql
# Current faithfulness score
avg(ace_evaluation_faithfulness_score)

# Faithfulness over time
avg_over_time(ace_evaluation_faithfulness_score[1h])
```

### Agent Performance

```promql
# Agent execution time P95
histogram_quantile(0.95, sum(rate(ace_agent_historian_duration_seconds_bucket[5m])) by (le))

# Agent failure rate
sum(rate(ace_agent_historian_failures_total[5m])) / sum(rate(ace_agent_historian_executions_total[5m])) * 100
```

## Resource Requirements

| Component | CPU Request | Memory Request | Storage |
|-----------|-------------|----------------|---------|
| Prometheus | 500m | 512Mi | 50Gi |
| Grafana | 200m | 256Mi | 10Gi |
| Jaeger | 250m | 512Mi | 20Gi |
| OTel Collector | 200m | 256Mi | - |

**Total**: ~1.2 CPU, ~1.5Gi memory, ~80Gi storage

## Troubleshooting

### Prometheus Not Scraping Services

```bash
# Check service discovery
kubectl exec -n monitoring deploy/prometheus -- promtool check config /etc/prometheus/prometheus.yml

# Check targets
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Visit http://localhost:9090/targets
```

### Grafana Not Showing Data

```bash
# Check data source connectivity
kubectl exec -n monitoring deploy/grafana -- curl -s http://prometheus:9090/api/v1/query?query=up

# Check Grafana logs
kubectl logs -n monitoring deploy/grafana
```

### Jaeger Not Receiving Traces

```bash
# Check collector health
kubectl exec -n monitoring deploy/otel-collector -- curl -s http://localhost:13133

# Check Jaeger connection
kubectl logs -n monitoring deploy/jaeger
```

### Alert Not Firing

```bash
# Check alert rules
kubectl exec -n monitoring deploy/prometheus -- promtool check rules /etc/prometheus/rules/*.yml

# View alert status
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Visit http://localhost:9090/alerts
```

## Maintenance

### Backup Prometheus Data

```bash
# Create snapshot
kubectl exec -n monitoring deploy/prometheus -- \
  curl -X POST http://localhost:9090/api/v1/admin/tsdb/snapshot

# Copy snapshot
kubectl cp monitoring/prometheus-xxx:/prometheus/snapshots/ ./prometheus-backup/
```

### Retention Management

Edit `prometheus.yaml`:
```yaml
args:
  - '--storage.tsdb.retention.time=30d'  # Adjust retention
  - '--storage.tsdb.retention.size=45GB'  # Add size limit
```

### Upgrading Components

```bash
# Update image version in deployment YAML
# Then apply changes
kubectl apply -f prometheus.yaml
kubectl rollout status deployment/prometheus -n monitoring
```

---

## Files in This Directory

| File | Description |
|------|-------------|
| `prometheus.yaml` | Prometheus deployment, service, RBAC, config |
| `alerting-rules.yaml` | Alert rules for SLA and performance |
| `grafana.yaml` | Grafana deployment, dashboards, data sources |
| `jaeger.yaml` | Jaeger all-in-one deployment |
| `otel-collector.yaml` | OpenTelemetry Collector for trace routing |
| `README.md` | This documentation |

---

**Last Updated**: 2025-11-21
**Stack Version**: Prometheus 2.47, Grafana 10.0, Jaeger 1.50, OTel Collector 0.88
