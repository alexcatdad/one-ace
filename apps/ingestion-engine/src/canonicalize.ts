import type { CanonicalEntity, ClassifiedEntity } from './types';

/**
 * Generate a deterministic canonical ID based on entity type and name
 * This ensures the same entity referenced in different texts gets the same ID
 */
function generateCanonicalId(type: string, name: string): string {
  const normalized = name.toLowerCase().trim().replace(/\s+/g, '-');
  return `${type.toLowerCase()}-${normalized}`;
}

/**
 * Canonicalize classified entities by merging duplicates and assigning permanent IDs
 * Implements the "Canonicalize" step of the EDC pattern
 *
 * In production, this would query Neo4j to check for existing entities.
 * For Phase 2, we use deterministic ID generation based on name.
 */
export async function canonicalizeEntities(
  classifiedEntities: ClassifiedEntity[],
): Promise<CanonicalEntity[]> {
  const canonicalMap = new Map<string, CanonicalEntity>();

  for (const entity of classifiedEntities) {
    const entityName = (entity.attributes.name as string) || 'unknown';
    const canonicalId = generateCanonicalId(entity.canonicalType, entityName);

    const existing = canonicalMap.get(canonicalId);
    if (existing) {
      // Merge with existing canonical entity
      existing.mergedFrom.push(entity.id);

      // Merge attributes (prefer higher confidence values)
      for (const [key, value] of Object.entries(entity.attributes)) {
        if (!existing.properties[key] || entity.confidence > 0.7) {
          existing.properties[key] = value;
        }
      }
    } else {
      // Create new canonical entity
      canonicalMap.set(canonicalId, {
        id: canonicalId,
        type: entity.canonicalType,
        properties: { ...entity.attributes },
        mergedFrom: [entity.id],
        isNew: true,
      });
    }
  }

  return Array.from(canonicalMap.values());
}

/**
 * Resolve entity references in relationships to canonical IDs
 */
export function resolveRelationshipReferences(
  relationships: Array<{ from: string; to: string; type: string }>,
  canonicalEntities: CanonicalEntity[],
): Array<{ fromId: string; toId: string; type: string }> {
  // Build mention -> canonical ID map
  const mentionMap = new Map<string, string>();

  for (const entity of canonicalEntities) {
    const name = (entity.properties.name as string)?.toLowerCase() || '';
    if (name) {
      mentionMap.set(name, entity.id);
    }
  }

  const resolved: Array<{ fromId: string; toId: string; type: string }> = [];

  for (const rel of relationships) {
    const fromNormalized = rel.from.toLowerCase().trim();
    const toNormalized = rel.to.toLowerCase().trim();

    const fromId = mentionMap.get(fromNormalized);
    const toId = mentionMap.get(toNormalized);

    if (fromId && toId) {
      resolved.push({
        fromId,
        toId,
        type: rel.type,
      });
    }
  }

  return resolved;
}
