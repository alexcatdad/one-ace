/**
 * Consistency Checker Agent - Validates generated lore for consistency
 * Checks schema compliance and detects contradictions
 */

import {
  CharacterSchema,
  EventSchema,
  FactionSchema,
  LocationSchema,
  ResourceSchema,
} from '@ace/core-types';
import { executeRead } from '@ace/neo4j-utilities';
import { z } from 'zod';
import type { ValidationResult, WorkflowState } from './state';

/**
 * Consistency Checker Agent: Validate generated lore
 */
export async function consistencyCheckerAgent(
  state: WorkflowState,
): Promise<Partial<WorkflowState>> {
  const startTime = Date.now();
  console.log('[consistency-checker] Starting validation');

  if (!state.generatedLore) {
    return {
      errors: [...state.errors, 'No generated lore to validate'],
    };
  }

  const schemaViolations: Array<{ field: string; issue: string }> = [];
  const contradictions: Array<{ newClaim: string; existingFact: string; conflictType: string }> =
    [];

  try {
    // 1. Schema validation for each entity
    for (const entity of state.generatedLore.entities) {
      const violations = validateEntitySchema(entity);
      schemaViolations.push(...violations);
    }

    // 2. Check for contradictions with existing knowledge graph
    for (const entity of state.generatedLore.entities) {
      const conflicts = await checkEntityContradictions(entity, state);
      contradictions.push(...conflicts);
    }

    // 3. Calculate overall consistency score
    const totalChecks = state.generatedLore.entities.length * 2; // Schema + contradiction checks
    const totalIssues = schemaViolations.length + contradictions.length;
    const consistencyScore = totalChecks > 0 ? (totalChecks - totalIssues) / totalChecks : 1.0;

    // 4. Determine if valid
    const schemaCompliant = schemaViolations.length === 0;
    const noContradictions = contradictions.length === 0;
    const isValid = schemaCompliant && noContradictions && consistencyScore >= 0.8;

    const validationResult: ValidationResult = {
      isValid,
      schemaCompliant,
      consistencyScore: Number(consistencyScore.toFixed(2)),
      schemaViolations,
      contradictions,
      suggestedFixes: generateFixes(schemaViolations, contradictions),
      requiresRevision: !isValid && state.iterationCount < state.maxIterations,
      validationTimeMs: Date.now() - startTime,
    };

    console.log(
      `[consistency-checker] Validation complete in ${validationResult.validationTimeMs}ms: ` +
        `Valid=${isValid}, Score=${validationResult.consistencyScore}, ` +
        `Violations=${schemaViolations.length}, Contradictions=${contradictions.length}`,
    );

    return {
      validationResult,
    };
  } catch (error) {
    console.error('[consistency-checker] Error during validation:', error);
    return {
      validationResult: {
        isValid: false,
        schemaCompliant: false,
        consistencyScore: 0,
        schemaViolations: [
          {
            field: 'validation',
            issue: error instanceof Error ? error.message : 'Unknown validation error',
          },
        ],
        contradictions: [],
        suggestedFixes: [],
        requiresRevision: true,
        validationTimeMs: Date.now() - startTime,
      },
      errors: [
        ...state.errors,
        `Consistency checker error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
}

/**
 * Validate entity against appropriate schema
 */
function validateEntitySchema(entity: {
  type: string;
  name: string;
  properties: Record<string, unknown>;
}): Array<{ field: string; issue: string }> {
  const violations: Array<{ field: string; issue: string }> = [];

  try {
    const schemaMap: Record<string, z.ZodSchema> = {
      Faction: FactionSchema,
      Character: CharacterSchema,
      Location: LocationSchema,
      Resource: ResourceSchema,
      Event: EventSchema,
    };

    const schema = schemaMap[entity.type];
    if (!schema) {
      violations.push({
        field: 'type',
        issue: `Unknown entity type: ${entity.type}`,
      });
      return violations;
    }

    // Attempt to validate
    schema.parse({ name: entity.name, ...entity.properties });
  } catch (error) {
    if (error instanceof z.ZodError) {
      for (const issue of error.issues) {
        violations.push({
          field: issue.path.join('.'),
          issue: issue.message,
        });
      }
    } else {
      violations.push({
        field: entity.name,
        issue: `Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  return violations;
}

/**
 * Check if entity contradicts existing knowledge graph
 */
async function checkEntityContradictions(
  entity: {
    type: string;
    name: string;
    properties: Record<string, unknown>;
  },
  _state: WorkflowState,
): Promise<Array<{ newClaim: string; existingFact: string; conflictType: string }>> {
  const contradictions: Array<{ newClaim: string; existingFact: string; conflictType: string }> =
    [];

  try {
    // Check if entity already exists with different properties
    const query = `
      MATCH (n {name: $name})
      WHERE labels(n)[0] = $type
      RETURN n
      LIMIT 1
    `;

    const result = await executeRead(query, {
      name: entity.name,
      type: entity.type,
    });

    if ((result.records as Array<{ n: unknown }>).length > 0) {
      const recordData = (result.records as Array<{ n: unknown }>)[0];
      if (!recordData) {
        return contradictions;
      }
      const existing = recordData.n as unknown as Record<string, unknown>;

      // Compare key properties
      for (const [key, newValue] of Object.entries(entity.properties)) {
        if (key === 'id' || key === 'updated_at') continue;

        const existingValue = existing[key];
        if (existingValue && existingValue !== newValue) {
          contradictions.push({
            newClaim: `${entity.name}.${key} = ${newValue}`,
            existingFact: `${entity.name}.${key} = ${existingValue}`,
            conflictType: 'property_mismatch',
          });
        }
      }
    }
  } catch (error) {
    console.warn('[consistency-checker] Error checking contradictions:', error);
  }

  return contradictions;
}

/**
 * Generate suggested fixes for issues
 */
function generateFixes(
  schemaViolations: Array<{ field: string; issue: string }>,
  contradictions: Array<{ newClaim: string; existingFact: string; conflictType: string }>,
): string[] {
  const fixes: string[] = [];

  if (schemaViolations.length > 0) {
    fixes.push(`Fix ${schemaViolations.length} schema violations by adding required fields`);
  }

  if (contradictions.length > 0) {
    fixes.push(
      `Resolve ${contradictions.length} contradictions by aligning with existing knowledge`,
    );
  }

  if (fixes.length === 0) {
    fixes.push('No issues found - lore is consistent');
  }

  return fixes;
}
