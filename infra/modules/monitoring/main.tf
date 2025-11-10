resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = var.namespace
    labels = {
      "app.kubernetes.io/managed-by" = "terraform"
      "ace/environment"              = var.environment
    }
  }
}

resource "helm_release" "kube_prometheus_stack" {
  name       = "ace-prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name
  version    = "58.2.2"

  values = [
    yamlencode({
      grafana = {
        adminPassword = null
        additionalDataSources = [
          {
            name      = "tempo"
            type      = "tempo"
            access    = "proxy"
            url       = "http://tempo.monitoring.svc.cluster.local:3100"
            isDefault = false
          }
        ]
      }
      prometheus = {
        prometheusSpec = {
          retention = "15d"
        }
      }
    })
  ]
}

resource "helm_release" "tempo" {
  name       = "ace-tempo"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "tempo"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name
  version    = "1.9.0"
}

resource "helm_release" "opentelemetry_collector" {
  name       = "ace-otel"
  repository = "https://open-telemetry.github.io/opentelemetry-helm-charts"
  chart      = "opentelemetry-collector"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name
  version    = "0.86.0"

  values = [
    yamlencode({
      mode = "deployment"
      config = {
        receivers = {
          otlp = {
            protocols = {
              grpc = {}
              http = {}
            }
          }
        }
        processors = {
          batch = {}
          memory_limiter = {
            limit_mib = 400
          }
        }
        exporters = {
          loki = {
            endpoint = "http://loki.monitoring.svc.cluster.local:3100/loki/api/v1/push"
          }
          prometheusremotewrite = {
            endpoint = "http://ace-prometheus-kube-prometheus.prometheus.svc.cluster.local:9090/api/v1/write"
          }
          otlp = {
            endpoint = "tempo.monitoring.svc.cluster.local:4317"
            tls = {
              insecure = true
            }
          }
        }
        service = {
          pipelines = {
            traces = {
              receivers  = ["otlp"]
              processors = ["batch", "memory_limiter"]
              exporters  = ["otlp"]
            }
            metrics = {
              receivers  = ["otlp"]
              processors = ["batch", "memory_limiter"]
              exporters  = ["prometheusremotewrite"]
            }
            logs = {
              receivers  = ["otlp"]
              processors = ["batch"]
              exporters  = ["loki"]
            }
          }
        }
      }
    })
  ]
}

