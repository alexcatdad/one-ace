/**
 * Historian Agent - Retrieves relevant context using GraphRAG
 * Combines Neo4j graph queries with Qdrant vector search
 */

import { executeRead } from '@ace/neo4j-utilities';
import { getVectorClient } from '@ace/vector-client';
import type { RetrievedContext, WorkflowState } from './state';

/**
 * Historian Agent: Retrieve relevant context for the user's query
 * Uses hybrid retrieval: vector similarity + graph traversal
 */
export async function historianAgent(state: WorkflowState): Promise<Partial<WorkflowState>> {
  const startTime = Date.now();
  console.log('[historian] Starting context retrieval for query:', state.userQuery);

  try {
    // Extract key entities from query (simple keyword extraction for now)
    const keywords = extractKeywords(state.userQuery);
    console.log('[historian] Extracted keywords:', keywords);

    // 1. Vector search for semantic similarity
    const vectorClient = getVectorClient();
    const similarDocs = await vectorClient.search(state.userQuery, {
      limit: 5,
      scoreThreshold: 0.7,
    });

    console.log(`[historian] Found ${similarDocs.length} similar documents`);

    // 2. Graph queries for related entities
    const graphEntities = [];
    const graphRelationships = [];

    // Query for each keyword to find related entities
    for (const keyword of keywords.slice(0, 3)) {
      // Limit to top 3 keywords
      try {
        // Search for entities by name (case-insensitive)
        const query = `
          MATCH (n)
          WHERE toLower(n.name) CONTAINS toLower($keyword)
          RETURN n
          LIMIT 5
        `;

        const result = await executeRead(query, { keyword });

        for (const record of result.records as Array<{ n: unknown }>) {
          const node = record.n as unknown as { id: string; type: string; [key: string]: unknown };
          if (node) {
            graphEntities.push({
              id: node.id,
              type: node.type || 'Unknown',
              properties: node,
            });
          }
        }
      } catch (error) {
        console.warn(`[historian] Error querying for keyword "${keyword}":`, error);
      }
    }

    // 3. Get relationships for found entities
    if (graphEntities.length > 0) {
      try {
        const entityIds = graphEntities.map((e) => e.id);
        const relQuery = `
          MATCH (a)-[r]->(b)
          WHERE a.id IN $entityIds OR b.id IN $entityIds
          RETURN a.id AS fromId, type(r) AS relType, b.id AS toId, properties(r) AS props
          LIMIT 20
        `;

        const relResult = await executeRead(relQuery, { entityIds });

        for (const record of relResult.records) {
          const rel = record as {
            fromId: string;
            relType: string;
            toId: string;
            props: Record<string, unknown>;
          };
          graphRelationships.push({
            type: rel.relType,
            from: rel.fromId,
            to: rel.toId,
            properties: rel.props,
          });
        }
      } catch (error) {
        console.warn('[historian] Error querying relationships:', error);
      }
    }

    // Calculate relevance score based on results
    const relevanceScore = calculateRelevance(
      similarDocs.length,
      graphEntities.length,
      graphRelationships.length,
    );

    const retrievalTimeMs = Date.now() - startTime;

    const retrievedContext: RetrievedContext = {
      graphEntities,
      graphRelationships,
      similarDocuments: similarDocs.map((doc) => ({
        id: doc.id,
        text: String(doc.payload.text || ''),
        score: doc.score,
        metadata: doc.payload,
      })),
      relevanceScore,
      retrievalTimeMs,
    };

    console.log(
      `[historian] Context retrieved in ${retrievalTimeMs}ms: ${graphEntities.length} entities, ${graphRelationships.length} relationships, ${similarDocs.length} documents`,
    );

    return {
      retrievedContext,
    };
  } catch (error) {
    console.error('[historian] Error during context retrieval:', error);
    return {
      retrievedContext: {
        graphEntities: [],
        graphRelationships: [],
        similarDocuments: [],
        relevanceScore: 0,
        retrievalTimeMs: Date.now() - startTime,
      },
      errors: [
        ...state.errors,
        `Historian error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
}

/**
 * Extract keywords from query for graph search
 */
function extractKeywords(query: string): string[] {
  // Simple keyword extraction - remove common words
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'what',
    'who',
    'where',
    'when',
    'why',
    'how',
    'tell',
    'me',
    'about',
  ]);

  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .slice(0, 5); // Top 5 keywords
}

/**
 * Calculate relevance score based on retrieval results
 */
function calculateRelevance(
  docCount: number,
  entityCount: number,
  relationshipCount: number,
): number {
  // Simple scoring: weight different sources
  const docScore = Math.min(docCount / 5, 1) * 0.4; // Max 40% from docs
  const entityScore = Math.min(entityCount / 10, 1) * 0.3; // Max 30% from entities
  const relScore = Math.min(relationshipCount / 20, 1) * 0.3; // Max 30% from relationships

  return Number((docScore + entityScore + relScore).toFixed(2));
}
