import { z } from 'zod';

/**
 * Raw text input for ingestion
 */
export const IngestionRequestSchema = z.object({
  text: z.string().min(1, 'Text content is required'),
  sourceId: z.string().optional().describe('Identifier for source document'),
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Additional metadata about the source'),
});

export type IngestionRequest = z.infer<typeof IngestionRequestSchema>;

/**
 * Extracted entity from text (Extract step)
 */
export const ExtractedEntitySchema = z.object({
  type: z.enum(['Faction', 'Character', 'Location', 'Resource', 'Event']),
  mentions: z.array(z.string()).describe('All text references to this entity'),
  attributes: z.record(z.string(), z.unknown()).describe('Raw attributes extracted from text'),
  confidence: z.number().min(0).max(1),
});

export type ExtractedEntity = z.infer<typeof ExtractedEntitySchema>;

/**
 * Extracted relationship from text (Extract step)
 */
export const ExtractedRelationshipSchema = z.object({
  from: z.string().describe('Source entity mention'),
  to: z.string().describe('Target entity mention'),
  type: z.string().describe('Relationship type as described in text'),
  evidence: z.string().describe('Text passage supporting this relationship'),
  confidence: z.number().min(0).max(1),
});

export type ExtractedRelationship = z.infer<typeof ExtractedRelationshipSchema>;

/**
 * Result of extraction step
 */
export const ExtractionResultSchema = z.object({
  entities: z.array(ExtractedEntitySchema),
  relationships: z.array(ExtractedRelationshipSchema),
  extractionTimeMs: z.number(),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

/**
 * Classified entity (Define step)
 */
export const ClassifiedEntitySchema = z.object({
  id: z.string().describe('Temporary ID for this extraction'),
  type: z.enum(['Faction', 'Character', 'Location', 'Resource', 'Event']),
  canonicalType: z.string().describe('Mapped to ontology node label'),
  attributes: z.record(z.string(), z.unknown()),
  confidence: z.number().min(0).max(1),
});

export type ClassifiedEntity = z.infer<typeof ClassifiedEntitySchema>;

/**
 * Canonical entity with permanent ID (Canonicalize step)
 */
export const CanonicalEntitySchema = z.object({
  id: z.string().describe('Canonical ID (either existing or newly generated)'),
  type: z.string().describe('Node label from ontology'),
  properties: z.record(z.string(), z.unknown()).describe('Final properties for Neo4j'),
  mergedFrom: z
    .array(z.string())
    .describe('Temporary IDs that were merged into this canonical entity'),
  isNew: z.boolean().describe('Whether this is a new entity or merged with existing'),
});

export type CanonicalEntity = z.infer<typeof CanonicalEntitySchema>;

/**
 * Final ingestion result
 */
export const IngestionResultSchema = z.object({
  jobId: z.string(),
  status: z.enum(['completed', 'partial', 'failed']),
  entitiesCreated: z.number(),
  relationshipsCreated: z.number(),
  extractionTimeMs: z.number(),
  defineTimeMs: z.number(),
  canonicalizeTimeMs: z.number(),
  graphWriteTimeMs: z.number(),
  totalTimeMs: z.number(),
  errors: z.array(z.string()).optional(),
});

export type IngestionResult = z.infer<typeof IngestionResultSchema>;

/**
 * Worker message types
 */
export interface WorkerJob {
  id: string;
  request: IngestionRequest;
}

export interface WorkerResult {
  jobId: string;
  result: IngestionResult;
}
