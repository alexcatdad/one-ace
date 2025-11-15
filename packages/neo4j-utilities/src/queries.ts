/**
 * Common Cypher query templates for ACE knowledge graph operations
 * Uses MERGE for idempotent operations to support concurrent writes
 */

/**
 * Node creation queries using MERGE for idempotency
 */
export const NodeQueries = {
  /**
   * Create or update a Faction node
   */
  mergeFaction: `
    MERGE (f:Faction {id: $id})
    SET f.name = $name,
        f.alignment = $alignment,
        f.core_motivation = $core_motivation,
        f.leader_name = $leader_name,
        f.relationship_to_hegemony = $relationship_to_hegemony,
        f.justification = $justification,
        f.updated_at = datetime()
    RETURN f
  `,

  /**
   * Create or update a Character node
   */
  mergeCharacter: `
    MERGE (c:Character {id: $id})
    SET c.name = $name,
        c.role = $role,
        c.description = $description,
        c.updated_at = datetime()
    RETURN c
  `,

  /**
   * Create or update a Location node
   */
  mergeLocation: `
    MERGE (l:Location {id: $id})
    SET l.name = $name,
        l.type = $type,
        l.description = $description,
        l.strategic_importance = $strategic_importance,
        l.updated_at = datetime()
    RETURN l
  `,

  /**
   * Create or update a Resource node
   */
  mergeResource: `
    MERGE (r:Resource {id: $id})
    SET r.name = $name,
        r.type = $type,
        r.quantity = $quantity,
        r.description = $description,
        r.updated_at = datetime()
    RETURN r
  `,

  /**
   * Create or update an Event node
   */
  mergeEvent: `
    MERGE (e:Event {id: $id})
    SET e.name = $name,
        e.type = $type,
        e.timestamp = $timestamp,
        e.description = $description,
        e.outcome = $outcome,
        e.updated_at = datetime()
    RETURN e
  `,
};

/**
 * Relationship creation queries using MERGE for idempotency
 */
export const RelationshipQueries = {
  /**
   * Create CONTROLS_RESOURCE relationship between Faction and Resource
   */
  controlsResource: `
    MATCH (f:Faction {id: $factionId})
    MATCH (r:Resource {id: $resourceId})
    MERGE (f)-[rel:CONTROLS_RESOURCE]->(r)
    SET rel.since = COALESCE(rel.since, $since),
        rel.updated_at = datetime()
    RETURN f, rel, r
  `,

  /**
   * Create IS_ALLY_OF relationship between Factions
   */
  isAllyOf: `
    MATCH (f1:Faction {id: $factionId1})
    MATCH (f2:Faction {id: $factionId2})
    MERGE (f1)-[rel:IS_ALLY_OF]->(f2)
    SET rel.since = COALESCE(rel.since, $since),
        rel.strength = $strength,
        rel.updated_at = datetime()
    RETURN f1, rel, f2
  `,

  /**
   * Create PARTICIPATED_IN relationship between Character and Event
   */
  participatedIn: `
    MATCH (c:Character {id: $characterId})
    MATCH (e:Event {id: $eventId})
    MERGE (c)-[rel:PARTICIPATED_IN]->(e)
    SET rel.role = $role,
        rel.updated_at = datetime()
    RETURN c, rel, e
  `,

  /**
   * Create LOCATED_IN relationship between entity and Location
   */
  locatedIn: `
    MATCH (entity {id: $entityId})
    MATCH (l:Location {id: $locationId})
    MERGE (entity)-[rel:LOCATED_IN]->(l)
    SET rel.updated_at = datetime()
    RETURN entity, rel, l
  `,

  /**
   * Create COMMANDS relationship between Character and Faction
   */
  commands: `
    MATCH (c:Character {id: $characterId})
    MATCH (f:Faction {id: $factionId})
    MERGE (c)-[rel:COMMANDS]->(f)
    SET rel.since = COALESCE(rel.since, $since),
        rel.updated_at = datetime()
    RETURN c, rel, f
  `,

  /**
   * Create MEMBER_OF relationship between Character and Faction
   */
  memberOf: `
    MATCH (c:Character {id: $characterId})
    MATCH (f:Faction {id: $factionId})
    MERGE (c)-[rel:MEMBER_OF]->(f)
    SET rel.rank = $rank,
        rel.since = COALESCE(rel.since, $since),
        rel.updated_at = datetime()
    RETURN c, rel, f
  `,
};

/**
 * Read queries for retrieving graph data
 */
export const ReadQueries = {
  /**
   * Get all factions and their relationships
   */
  getAllFactions: `
    MATCH (f:Faction)
    OPTIONAL MATCH (f)-[r:CONTROLS_RESOURCE]->(res:Resource)
    RETURN f, collect(res) as resources
  `,

  /**
   * Get faction with all related entities (Graph RAG query)
   */
  getFactionContext: `
    MATCH (f:Faction {id: $factionId})
    OPTIONAL MATCH (f)-[:CONTROLS_RESOURCE]->(r:Resource)
    OPTIONAL MATCH (c:Character)-[:MEMBER_OF|COMMANDS]->(f)
    OPTIONAL MATCH (f)-[:IS_ALLY_OF]-(ally:Faction)
    OPTIONAL MATCH (c)-[:PARTICIPATED_IN]->(e:Event)
    RETURN f,
           collect(DISTINCT r) as resources,
           collect(DISTINCT c) as characters,
           collect(DISTINCT ally) as allies,
           collect(DISTINCT e) as events
  `,

  /**
   * Multi-hop query: Find all factions connected to a resource through alliances
   */
  findIndirectResourceControl: `
    MATCH path = (f:Faction)-[:IS_ALLY_OF*1..3]-(ally:Faction)-[:CONTROLS_RESOURCE]->(r:Resource {id: $resourceId})
    WHERE f.id = $factionId
    RETURN path, length(path) as hops
    ORDER BY hops ASC
  `,

  /**
   * Find contradictions: Factions marked as allies but with conflicting events
   */
  findPotentialContradictions: `
    MATCH (f1:Faction)-[ally:IS_ALLY_OF]-(f2:Faction)
    MATCH (c1:Character)-[:MEMBER_OF]->(f1)-[:PARTICIPATED_IN]->(e1:Event)
    MATCH (c2:Character)-[:MEMBER_OF]->(f2)-[:PARTICIPATED_IN]->(e2:Event)
    WHERE e1.type = 'BATTLE' AND e2.type = 'BATTLE'
      AND e1.timestamp = e2.timestamp
    RETURN f1, f2, ally, e1, e2
  `,

  /**
   * Get all events for a time range
   */
  getEventsByTimeRange: `
    MATCH (e:Event)
    WHERE e.timestamp >= $startTime AND e.timestamp <= $endTime
    OPTIONAL MATCH (c:Character)-[:PARTICIPATED_IN]->(e)
    RETURN e, collect(c) as participants
    ORDER BY e.timestamp ASC
  `,
};
