import type { Session } from 'neo4j-driver';
import { createSession } from './driver';
import type { QueryMetadata, QueryResult } from './types';

/**
 * Execute a read query within a transaction
 * Automatically manages session lifecycle
 *
 * @param cypher - Cypher query string
 * @param parameters - Query parameters
 * @param database - Optional database name
 * @returns Query results with metadata
 */
export async function executeRead<T = unknown>(
  cypher: string,
  parameters: Record<string, unknown> = {},
  database?: string,
): Promise<QueryResult<T>> {
  const session = createSession(database);
  try {
    const startTime = Date.now();
    const result = await session.executeRead((tx) => tx.run(cypher, parameters));

    const metadata: QueryMetadata = {
      nodesCreated: 0,
      nodesDeleted: 0,
      relationshipsCreated: 0,
      relationshipsDeleted: 0,
      propertiesSet: 0,
      executionTimeMs: Date.now() - startTime,
    };

    return {
      records: result.records.map((record) => record.toObject() as T),
      metadata,
    };
  } finally {
    await session.close();
  }
}

/**
 * Execute a write query within a transaction
 * Automatically manages session lifecycle and captures counters
 *
 * @param cypher - Cypher query string
 * @param parameters - Query parameters
 * @param database - Optional database name
 * @returns Query results with metadata
 */
export async function executeWrite<T = unknown>(
  cypher: string,
  parameters: Record<string, unknown> = {},
  database?: string,
): Promise<QueryResult<T>> {
  const session = createSession(database);
  try {
    const startTime = Date.now();
    const result = await session.executeWrite((tx) => tx.run(cypher, parameters));

    const counters = result.summary.counters.updates();
    const metadata: QueryMetadata = {
      nodesCreated: counters.nodesCreated,
      nodesDeleted: counters.nodesDeleted,
      relationshipsCreated: counters.relationshipsCreated,
      relationshipsDeleted: counters.relationshipsDeleted,
      propertiesSet: counters.propertiesSet,
      executionTimeMs: Date.now() - startTime,
    };

    return {
      records: result.records.map((record) => record.toObject() as T),
      metadata,
    };
  } finally {
    await session.close();
  }
}

/**
 * Execute multiple write queries in a single transaction
 * Provides atomicity - all queries succeed or all fail
 *
 * @param queries - Array of query objects with cypher and parameters
 * @param database - Optional database name
 * @returns Combined metadata from all queries
 */
export async function executeTransaction(
  queries: Array<{ cypher: string; parameters?: Record<string, unknown> }>,
  database?: string,
): Promise<QueryMetadata> {
  const session = createSession(database);
  try {
    const startTime = Date.now();
    const result = await session.executeWrite(async (tx) => {
      const results = [];
      for (const query of queries) {
        results.push(await tx.run(query.cypher, query.parameters ?? {}));
      }
      return results;
    });

    // Aggregate counters from all query results
    const aggregatedCounters = result.reduce(
      (acc, res) => {
        const counters = res.summary.counters.updates();
        return {
          nodesCreated: acc.nodesCreated + counters.nodesCreated,
          nodesDeleted: acc.nodesDeleted + counters.nodesDeleted,
          relationshipsCreated: acc.relationshipsCreated + counters.relationshipsCreated,
          relationshipsDeleted: acc.relationshipsDeleted + counters.relationshipsDeleted,
          propertiesSet: acc.propertiesSet + counters.propertiesSet,
        };
      },
      {
        nodesCreated: 0,
        nodesDeleted: 0,
        relationshipsCreated: 0,
        relationshipsDeleted: 0,
        propertiesSet: 0,
      },
    );

    return {
      ...aggregatedCounters,
      executionTimeMs: Date.now() - startTime,
    };
  } finally {
    await session.close();
  }
}

/**
 * Execute a query with manual session management
 * Useful for complex workflows requiring multiple operations
 *
 * @param callback - Function receiving a session to execute operations
 * @param database - Optional database name
 * @returns Result from the callback
 */
export async function withSession<T>(
  callback: (session: Session) => Promise<T>,
  database?: string,
): Promise<T> {
  const session = createSession(database);
  try {
    return await callback(session);
  } finally {
    await session.close();
  }
}
