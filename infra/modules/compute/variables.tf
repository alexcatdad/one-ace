variable "environment" {
  description = "Deployment environment identifier"
  type        = string
}

variable "vpc_id" {
  description = "VPC identifier where the cluster will reside"
  type        = string
}

variable "private_subnets" {
  description = "List of private subnet IDs for worker nodes"
  type        = list(string)
}

variable "cluster_version" {
  description = "Kubernetes version for the cluster"
  type        = string
  default     = "1.30"
}

