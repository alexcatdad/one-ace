variable "environment" {
  description = "Deployment environment identifier"
  type        = string
}

variable "vpc_id" {
  description = "VPC identifier for Redis"
  type        = string
}

variable "private_subnets" {
  description = "List of private subnet IDs for Redis subnet group"
  type        = list(string)
}

variable "node_type" {
  description = "ElastiCache node instance type"
  type        = string
  default     = "cache.t3.small"
}

variable "replicas" {
  description = "Number of Redis replicas (excluding primary)"
  type        = number
  default     = 1
}

