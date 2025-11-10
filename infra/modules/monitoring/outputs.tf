output "namespace" {
  description = "Namespace where monitoring stack is deployed"
  value       = kubernetes_namespace.monitoring.metadata[0].name
}

output "grafana_release_name" {
  description = "Helm release name for Grafana (kube-prometheus-stack)"
  value       = helm_release.kube_prometheus_stack.name
}

