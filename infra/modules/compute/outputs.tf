output "cluster_name" {
  description = "Name of the EKS cluster"
  value       = aws_eks_cluster.this.name
}

output "cluster_endpoint" {
  description = "API endpoint for the EKS cluster"
  value       = aws_eks_cluster.this.endpoint
}

output "cluster_ca" {
  description = "Cluster certificate authority data (base64 encoded)"
  value       = aws_eks_cluster.this.certificate_authority[0].data
}

output "cluster_auth_token" {
  description = "IAM-authenticated token for cluster access"
  value       = data.aws_eks_cluster_auth.this.token
  sensitive   = true
}

