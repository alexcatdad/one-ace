variable "environment" {
  description = "Deployment environment identifier"
  type        = string
}

variable "cluster_name" {
  description = "Name of the Kubernetes cluster"
  type        = string
}

variable "cluster_endpoint" {
  description = "API endpoint of the Kubernetes cluster"
  type        = string
}

variable "namespace" {
  description = "Namespace for monitoring resources"
  type        = string
  default     = "monitoring"
}

