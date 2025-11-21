/**
 * Type definitions for vector client operations
 */

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  embeddingTimeMs: number;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  payload: Record<string, unknown>;
}

export interface VectorSearchOptions {
  limit?: number;
  scoreThreshold?: number;
  filter?: Record<string, unknown>;
}

export interface VectorDocument {
  id: string;
  text: string;
  metadata: Record<string, unknown>;
}

export interface UpsertResult {
  operation_id: number;
  status: 'completed' | 'acknowledged';
}
