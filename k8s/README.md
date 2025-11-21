# ACE Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the ACE (Architected Consistency Engine) platform to a production Kubernetes cluster.

## Architecture

The ACE system consists of the following components:

- **API Gateway** (3-10 replicas, autoscaling)
- **Inference Service** (2-8 replicas, autoscaling)
- **Ingestion Engine** (2-6 replicas, autoscaling)
- **Evaluation Service** (1 replica)
- **Web UI** (2-5 replicas, autoscaling)
- **Neo4j** (1 replica, StatefulSet with persistent storage)
- **Qdrant** (1 replica, StatefulSet with persistent storage)
- **Ollama** (1 replica with GPU)

## Prerequisites

1. **Kubernetes Cluster**: v1.25+ with:
   - At least 3 worker nodes
   - Minimum 32GB RAM total
   - GPU node for Ollama (optional but recommended)
   - 200GB+ storage capacity

2. **Ingress Controller**: NGINX Ingress Controller
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
   ```

3. **Cert Manager** (for TLS certificates):
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
   ```

4. **Metrics Server** (for HPA):
   ```bash
   kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
   ```

5. **Container Registry**: Push images to your registry:
   ```bash
   # Build images
   docker build -t your-registry/ace-api-gateway:latest -f apps/api-gateway/Dockerfile .
   docker build -t your-registry/ace-inference-service:latest -f apps/inference-service/Dockerfile .
   docker build -t your-registry/ace-ingestion-engine:latest -f apps/ingestion-engine/Dockerfile .
   docker build -t your-registry/ace-evaluation-service:latest -f apps/evaluation-service/Dockerfile .
   docker build -t your-registry/ace-web-ui:latest -f apps/web-ui/Dockerfile .

   # Push images
   docker push your-registry/ace-api-gateway:latest
   docker push your-registry/ace-inference-service:latest
   docker push your-registry/ace-ingestion-engine:latest
   docker push your-registry/ace-evaluation-service:latest
   docker push your-registry/ace-web-ui:latest
   ```

## Deployment Steps

### 1. Update Configuration

Edit the following files with your specific values:

**`secrets.yaml`**:
```yaml
stringData:
  NEO4J_PASSWORD: "your-secure-password"
```

**`ingress.yaml`**:
```yaml
spec:
  tls:
    - hosts:
        - ace.yourdomain.com  # Replace with your domain
```

**All deployment YAMLs**:
```yaml
image: your-registry/ace-api-gateway:latest  # Replace with your registry
```

### 2. Create Namespace

```bash
kubectl apply -f namespace.yaml
```

### 3. Deploy Configuration

```bash
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
```

### 4. Deploy Infrastructure (StatefulSets)

```bash
# Neo4j
kubectl apply -f neo4j-statefulset.yaml

# Qdrant
kubectl apply -f qdrant-statefulset.yaml

# Ollama (requires GPU node)
kubectl apply -f ollama-deployment.yaml
```

Wait for infrastructure to be ready:
```bash
kubectl wait --for=condition=ready pod -l app=neo4j -n ace --timeout=300s
kubectl wait --for=condition=ready pod -l app=qdrant -n ace --timeout=300s
kubectl wait --for=condition=ready pod -l app=ollama -n ace --timeout=300s
```

### 5. Load Models into Ollama

```bash
# Get Ollama pod name
OLLAMA_POD=$(kubectl get pod -n ace -l app=ollama -o jsonpath='{.items[0].metadata.name}')

# Load models
kubectl exec -n ace $OLLAMA_POD -- ollama pull llama3.2:3b
kubectl exec -n ace $OLLAMA_POD -- ollama pull nomic-embed-text
```

### 6. Deploy Application Services

```bash
kubectl apply -f api-gateway-deployment.yaml
kubectl apply -f inference-service-deployment.yaml
kubectl apply -f ingestion-engine-deployment.yaml
kubectl apply -f evaluation-service-deployment.yaml
kubectl apply -f web-ui-deployment.yaml
```

### 7. Deploy Ingress

```bash
kubectl apply -f ingress.yaml
```

### 8. Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n ace

# Check services
kubectl get services -n ace

# Check ingress
kubectl get ingress -n ace

# Check HPA status
kubectl get hpa -n ace

# View logs
kubectl logs -n ace -l app=api-gateway --tail=50
kubectl logs -n ace -l app=inference-service --tail=50
```

## Accessing the Application

Once deployed, access the application at:
- **Web UI**: https://ace.yourdomain.com
- **API**: https://ace.yourdomain.com/api

## Monitoring

View resource usage:
```bash
# Pod metrics
kubectl top pods -n ace

# Node metrics
kubectl top nodes
```

## Scaling

### Manual Scaling

```bash
# Scale a deployment
kubectl scale deployment api-gateway -n ace --replicas=5

# Scale inference service
kubectl scale deployment inference-service -n ace --replicas=4
```

### Autoscaling

HPA is configured for:
- **API Gateway**: 3-10 replicas (CPU: 70%, Memory: 80%)
- **Inference Service**: 2-8 replicas (CPU: 70%)
- **Ingestion Engine**: 2-6 replicas (CPU: 70%)
- **Web UI**: 2-5 replicas (CPU: 70%)

View HPA status:
```bash
kubectl get hpa -n ace -w
```

## Troubleshooting

### Pod Not Starting

```bash
# Describe pod
kubectl describe pod <pod-name> -n ace

# Check events
kubectl get events -n ace --sort-by='.lastTimestamp'

# View logs
kubectl logs <pod-name> -n ace
```

### Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints -n ace

# Check ingress
kubectl describe ingress ace-ingress -n ace

# Test service internally
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n ace -- \
  curl http://api-gateway-service:3000/health
```

### Database Connection Issues

```bash
# Check Neo4j logs
kubectl logs -n ace -l app=neo4j --tail=100

# Check Qdrant logs
kubectl logs -n ace -l app=qdrant --tail=100

# Test connectivity
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n ace -- \
  curl http://neo4j-service:7474
```

### HPA Not Scaling

```bash
# Check metrics server
kubectl get apiservice v1beta1.metrics.k8s.io

# Check HPA status
kubectl describe hpa api-gateway-hpa -n ace

# View metrics
kubectl top pods -n ace
```

## Updating the Application

### Rolling Update

```bash
# Update image
kubectl set image deployment/api-gateway \
  api-gateway=your-registry/ace-api-gateway:v1.1.0 -n ace

# Check rollout status
kubectl rollout status deployment/api-gateway -n ace

# Rollback if needed
kubectl rollout undo deployment/api-gateway -n ace
```

### Zero-Downtime Deployment

1. Build and push new image with version tag
2. Update deployment YAML with new image tag
3. Apply changes:
   ```bash
   kubectl apply -f api-gateway-deployment.yaml
   ```
4. Monitor rollout:
   ```bash
   kubectl rollout status deployment/api-gateway -n ace
   ```

## Backup and Recovery

### Backup Neo4j

```bash
# Create backup
kubectl exec -n ace neo4j-0 -- neo4j-admin database dump neo4j --to-path=/backups

# Copy backup to local machine
kubectl cp ace/neo4j-0:/backups/neo4j.dump ./neo4j-backup-$(date +%Y%m%d).dump
```

### Backup Qdrant

```bash
# Create snapshot
kubectl exec -n ace qdrant-0 -- curl -X POST http://localhost:6333/snapshots

# Copy snapshot
kubectl cp ace/qdrant-0:/qdrant/storage/snapshots ./qdrant-backup-$(date +%Y%m%d)
```

### Restore from Backup

```bash
# Restore Neo4j
kubectl cp ./neo4j-backup.dump ace/neo4j-0:/backups/neo4j.dump
kubectl exec -n ace neo4j-0 -- neo4j-admin database load neo4j --from-path=/backups

# Restore Qdrant
kubectl cp ./qdrant-backup ace/qdrant-0:/qdrant/storage/snapshots/
kubectl exec -n ace qdrant-0 -- curl -X PUT http://localhost:6333/collections/lore/snapshots/recover
```

## Security Best Practices

1. **Update Secrets**: Change default passwords in `secrets.yaml`
2. **RBAC**: Create service accounts with minimal permissions
3. **Network Policies**: Restrict inter-pod communication
4. **TLS**: Use valid certificates (Let's Encrypt via cert-manager)
5. **Image Security**: Scan images for vulnerabilities
6. **Pod Security**: Use Pod Security Standards
7. **Secrets Management**: Use external secret manager (Vault, AWS Secrets Manager)

## Resource Requirements

### Minimum Cluster Capacity

- **CPU**: 16 cores
- **Memory**: 32GB
- **Storage**: 200GB SSD
- **GPU**: 1 NVIDIA GPU (for Ollama)

### Per-Component Resources

| Component | Replicas | CPU Request | Memory Request | Storage |
|-----------|----------|-------------|----------------|---------|
| API Gateway | 3-10 | 200m | 256Mi | - |
| Inference Service | 2-8 | 500m | 512Mi | - |
| Ingestion Engine | 2-6 | 500m | 512Mi | - |
| Evaluation Service | 1 | 500m | 512Mi | - |
| Web UI | 2-5 | 100m | 128Mi | - |
| Neo4j | 1 | 1000m | 2Gi | 20Gi |
| Qdrant | 1 | 500m | 1Gi | 50Gi |
| Ollama | 1 | 2000m | 4Gi | 100Gi |

## Cost Estimation

### Cloud Provider Estimates (Monthly)

**AWS EKS**:
- 3x t3.xlarge nodes: ~$300
- 1x g4dn.xlarge (GPU): ~$400
- EBS volumes (200GB): ~$20
- Load Balancer: ~$20
- **Total**: ~$740/month

**GCP GKE**:
- 3x n1-standard-4 nodes: ~$360
- 1x n1-standard-4 + T4 GPU: ~$450
- Persistent disks (200GB): ~$25
- Load Balancer: ~$20
- **Total**: ~$855/month

**Azure AKS**:
- 3x Standard_D4s_v3 nodes: ~$420
- 1x NC4as_T4_v3 (GPU): ~$520
- Managed disks (200GB): ~$30
- Load Balancer: ~$20
- **Total**: ~$990/month

## Support

For issues or questions:
- **Documentation**: See `/specs` directory
- **Issues**: GitHub Issues
- **Monitoring**: Check Prometheus/Grafana dashboards
- **Logs**: Use `kubectl logs` or centralized logging (ELK)

---

**Last Updated**: 2025-11-21
**Kubernetes Version**: 1.25+
**Tested On**: EKS 1.28, GKE 1.28, AKS 1.28
