import { executeWrite, NodeQueries, RelationshipQueries } from '@ace/neo4j-utilities';
import type { CanonicalEntity } from './types';

/**
 * Write canonical entities and relationships to Neo4j knowledge graph
 * Uses the neo4j-utilities package for idempotent MERGE operations
 */

interface GraphWriteResult {
  nodesCreated: number;
  relationshipsCreated: number;
  writeTimeMs: number;
}

/**
 * Write entities to Neo4j using MERGE queries
 * Phase 3: Real implementation using @ace/neo4j-utilities
 */
export async function writeToGraph(
  entities: CanonicalEntity[],
  relationships: Array<{ fromId: string; toId: string; type: string }>,
): Promise<GraphWriteResult> {
  const startTime = Date.now();

  let totalNodesCreated = 0;
  let totalRelationshipsCreated = 0;

  try {
    // Write all entities to Neo4j
    for (const entity of entities) {
      const query = getQueryForEntityType(entity.type);

      if (query) {
        const result = await executeWrite(query, {
          id: entity.id,
          ...entity.properties,
        });

        totalNodesCreated += result.metadata.nodesCreated;
        console.log(
          `[graph-writer] Created/updated ${entity.type} node: ${entity.id} (${result.metadata.nodesCreated} new)`,
        );
      } else {
        console.warn(`[graph-writer] No query found for entity type: ${entity.type}`);
      }
    }

    // Write all relationships to Neo4j
    for (const rel of relationships) {
      const query = getQueryForRelationType(rel.type);

      if (query) {
        const params = buildRelationshipParams(rel);
        const result = await executeWrite(query, params);

        totalRelationshipsCreated += result.metadata.relationshipsCreated;
        console.log(
          `[graph-writer] Created ${rel.type}: ${rel.fromId} -> ${rel.toId} (${result.metadata.relationshipsCreated} new)`,
        );
      } else {
        console.warn(`[graph-writer] No query found for relationship type: ${rel.type}`);
      }
    }

    const writeTimeMs = Date.now() - startTime;
    console.log(
      `[graph-writer] Completed: ${totalNodesCreated} nodes, ${totalRelationshipsCreated} relationships in ${writeTimeMs}ms`,
    );

    return {
      nodesCreated: totalNodesCreated,
      relationshipsCreated: totalRelationshipsCreated,
      writeTimeMs,
    };
  } catch (error) {
    console.error('[graph-writer] Error writing to Neo4j:', error);
    throw new Error(
      `Failed to write to knowledge graph: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Get appropriate Neo4j MERGE query for entity type
 * Maps to NodeQueries from neo4j-utilities
 */
function getQueryForEntityType(type: string): string | null {
  const queryMap: Record<string, string> = {
    Faction: NodeQueries.mergeFaction,
    Character: NodeQueries.mergeCharacter,
    Location: NodeQueries.mergeLocation,
    Resource: NodeQueries.mergeResource,
    Event: NodeQueries.mergeEvent,
  };

  return queryMap[type] || null;
}

/**
 * Get appropriate Neo4j relationship query for relationship type
 * Maps to RelationshipQueries from neo4j-utilities
 */
function getQueryForRelationType(type: string): string | null {
  const queryMap: Record<string, string> = {
    CONTROLS_RESOURCE: RelationshipQueries.controlsResource,
    IS_ALLY_OF: RelationshipQueries.isAllyOf,
    PARTICIPATED_IN: RelationshipQueries.participatedIn,
    LOCATED_IN: RelationshipQueries.locatedIn,
    COMMANDS: RelationshipQueries.commands,
    MEMBER_OF: RelationshipQueries.memberOf,
  };

  return queryMap[type] || null;
}

/**
 * Build parameters for relationship creation
 * Maps generic fromId/toId to specific query parameters
 */
function buildRelationshipParams(rel: {
  fromId: string;
  toId: string;
  type: string;
}): Record<string, unknown> {
  const baseParams: Record<string, unknown> = {
    since: new Date().toISOString(),
  };

  switch (rel.type) {
    case 'CONTROLS_RESOURCE':
      return {
        ...baseParams,
        factionId: rel.fromId,
        resourceId: rel.toId,
      };
    case 'IS_ALLY_OF':
      return {
        ...baseParams,
        factionId1: rel.fromId,
        factionId2: rel.toId,
        strength: 0.5, // Default strength
      };
    case 'PARTICIPATED_IN':
      return {
        ...baseParams,
        characterId: rel.fromId,
        eventId: rel.toId,
        role: 'participant', // Default role
      };
    case 'LOCATED_IN':
      return {
        ...baseParams,
        entityId: rel.fromId,
        locationId: rel.toId,
      };
    case 'COMMANDS':
      return {
        ...baseParams,
        characterId: rel.fromId,
        factionId: rel.toId,
      };
    case 'MEMBER_OF':
      return {
        ...baseParams,
        characterId: rel.fromId,
        factionId: rel.toId,
        rank: 'member', // Default rank
      };
    default:
      // Generic fallback
      return {
        fromId: rel.fromId,
        toId: rel.toId,
      };
  }
}
