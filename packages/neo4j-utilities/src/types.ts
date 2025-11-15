import { z } from 'zod';

/**
 * Neo4j connection configuration schema
 */
export const Neo4jConfigSchema = z.object({
  uri: z.string().url().describe('Neo4j connection URI (e.g., bolt://localhost:7687)'),
  username: z.string().min(1).describe('Neo4j authentication username'),
  password: z.string().min(1).describe('Neo4j authentication password'),
  database: z.string().default('neo4j').describe('Target database name'),
  maxConnectionPoolSize: z.number().int().positive().default(100),
  connectionTimeout: z.number().int().positive().default(30000),
});

export type Neo4jConfig = z.infer<typeof Neo4jConfigSchema>;

/**
 * Query result metadata
 */
export interface QueryMetadata {
  nodesCreated: number;
  nodesDeleted: number;
  relationshipsCreated: number;
  relationshipsDeleted: number;
  propertiesSet: number;
  executionTimeMs: number;
}

/**
 * Generic query result wrapper
 */
export interface QueryResult<T = unknown> {
  records: T[];
  metadata: QueryMetadata;
}
