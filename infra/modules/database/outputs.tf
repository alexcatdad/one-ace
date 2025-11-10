output "redis_primary_endpoint" {
  description = "Primary Redis connection endpoint"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "redis_reader_endpoint" {
  description = "Read replica endpoint for Redis"
  value       = aws_elasticache_replication_group.redis.reader_endpoint_address
}

