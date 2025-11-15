/// <reference lib="webworker" />

import { Ollama } from 'ollama';
import { canonicalizeEntities, resolveRelationshipReferences } from './canonicalize';
import { classifyEntities, normalizeRelationshipType } from './define';
import { extractEntitiesAndRelationships } from './extract';
import { writeToGraph } from './graph-writer';
import type { IngestionResult, WorkerJob, WorkerResult } from './types';

declare const self: DedicatedWorkerGlobalScope;

// Initialize Ollama client
const ollama = new Ollama({
  host: Bun.env.OLLAMA_HOST || 'http://localhost:11434',
});

/**
 * Process ingestion job using the EDC (Extract → Define → Canonicalize) pipeline
 */
async function processIngestion(job: WorkerJob): Promise<IngestionResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    console.log(`[worker] Starting EDC pipeline for job ${job.id}`);

    // STEP 1: EXTRACT - Extract entities and relationships from raw text
    const extractionResult = await extractEntitiesAndRelationships(job.request, ollama);
    console.log(
      `[worker] Extracted ${extractionResult.entities.length} entities, ${extractionResult.relationships.length} relationships`,
    );

    if (extractionResult.entities.length === 0) {
      return {
        jobId: job.id,
        status: 'failed',
        entitiesCreated: 0,
        relationshipsCreated: 0,
        extractionTimeMs: extractionResult.extractionTimeMs,
        defineTimeMs: 0,
        canonicalizeTimeMs: 0,
        graphWriteTimeMs: 0,
        totalTimeMs: Date.now() - startTime,
        errors: ['No entities extracted from text'],
      };
    }

    // STEP 2: DEFINE - Classify entities against ontology
    const defineStart = Date.now();
    const classifiedEntities = classifyEntities(extractionResult.entities);
    const defineTimeMs = Date.now() - defineStart;

    console.log(`[worker] Classified ${classifiedEntities.length} entities against ontology`);

    // STEP 3: CANONICALIZE - Merge duplicates and assign permanent IDs
    const canonicalizeStart = Date.now();
    const canonicalEntities = await canonicalizeEntities(classifiedEntities);
    const canonicalizeTimeMs = Date.now() - canonicalizeStart;

    console.log(`[worker] Canonicalized to ${canonicalEntities.length} unique entities`);

    // Normalize relationship types
    const normalizedRelationships = extractionResult.relationships.map((rel) => ({
      from: rel.from,
      to: rel.to,
      type: normalizeRelationshipType(rel.type),
    }));

    // Resolve relationship references to canonical IDs
    const resolvedRelationships = resolveRelationshipReferences(
      normalizedRelationships,
      canonicalEntities,
    );

    console.log(`[worker] Resolved ${resolvedRelationships.length} relationships to canonical IDs`);

    // STEP 4: WRITE - Persist to Neo4j knowledge graph
    const graphWriteResult = await writeToGraph(canonicalEntities, resolvedRelationships);

    return {
      jobId: job.id,
      status: 'completed',
      entitiesCreated: graphWriteResult.nodesCreated,
      relationshipsCreated: graphWriteResult.relationshipsCreated,
      extractionTimeMs: extractionResult.extractionTimeMs,
      defineTimeMs,
      canonicalizeTimeMs,
      graphWriteTimeMs: graphWriteResult.writeTimeMs,
      totalTimeMs: Date.now() - startTime,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('[worker] Ingestion pipeline failed:', error);
    return {
      jobId: job.id,
      status: 'failed',
      entitiesCreated: 0,
      relationshipsCreated: 0,
      extractionTimeMs: 0,
      defineTimeMs: 0,
      canonicalizeTimeMs: 0,
      graphWriteTimeMs: 0,
      totalTimeMs: Date.now() - startTime,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

self.onmessage = async (event: MessageEvent<WorkerJob>) => {
  const job = event.data;

  if (!job || !job.id || !job.request) {
    console.error('[worker] Invalid job received:', job);
    self.postMessage({
      jobId: 'unknown',
      result: {
        jobId: 'unknown',
        status: 'failed',
        entitiesCreated: 0,
        relationshipsCreated: 0,
        extractionTimeMs: 0,
        defineTimeMs: 0,
        canonicalizeTimeMs: 0,
        graphWriteTimeMs: 0,
        totalTimeMs: 0,
        errors: ['Invalid job format'],
      },
    } satisfies WorkerResult);
    return;
  }

  const result = await processIngestion(job);

  self.postMessage({
    jobId: job.id,
    result,
  } satisfies WorkerResult);
};
