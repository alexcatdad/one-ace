import neo4j, { type Driver, type Session } from 'neo4j-driver';
import type { Neo4jConfig } from './types';

/**
 * Singleton Neo4j driver instance
 */
let driverInstance: Driver | null = null;

/**
 * Initialize the Neo4j driver with configuration
 * Uses singleton pattern to ensure only one driver instance exists
 *
 * @param config - Neo4j connection configuration
 * @returns Configured Neo4j driver instance
 */
export function initializeDriver(config: Neo4jConfig): Driver {
  if (driverInstance) {
    return driverInstance;
  }

  driverInstance = neo4j.driver(config.uri, neo4j.auth.basic(config.username, config.password), {
    maxConnectionPoolSize: config.maxConnectionPoolSize,
    connectionTimeout: config.connectionTimeout,
  });

  return driverInstance;
}

/**
 * Get the current driver instance
 * Throws if driver has not been initialized
 *
 * @returns Current Neo4j driver instance
 * @throws Error if driver not initialized
 */
export function getDriver(): Driver {
  if (!driverInstance) {
    throw new Error(
      'Neo4j driver not initialized. Call initializeDriver() first with configuration.',
    );
  }
  return driverInstance;
}

/**
 * Create a new session for executing queries
 * Sessions should be closed after use via session.close()
 *
 * @param database - Optional database name (defaults to config database)
 * @returns Neo4j session instance
 */
export function createSession(database?: string): Session {
  const driver = getDriver();
  return driver.session({ database });
}

/**
 * Close the driver and all active connections
 * Should be called on application shutdown
 */
export async function closeDriver(): Promise<void> {
  if (driverInstance) {
    await driverInstance.close();
    driverInstance = null;
  }
}

/**
 * Verify database connectivity
 * Useful for health checks and startup validation
 *
 * @returns true if connection successful, false otherwise
 */
export async function verifyConnectivity(): Promise<boolean> {
  try {
    const driver = getDriver();
    await driver.verifyConnectivity();
    return true;
  } catch (error) {
    console.error('Neo4j connectivity verification failed:', error);
    return false;
  }
}
