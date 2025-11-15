import type { ClassifiedEntity, ExtractedEntity } from './types';

/**
 * Ontology mapping for entity types
 * Maps extracted types to canonical Neo4j node labels
 */
const ONTOLOGY_MAPPING: Record<string, string> = {
  Faction: 'Faction',
  Character: 'Character',
  Location: 'Location',
  Resource: 'Resource',
  Event: 'Event',
};

/**
 * Relationship type mapping to canonical Neo4j relationship types
 */
export const RELATIONSHIP_MAPPING: Record<string, string> = {
  // Faction relationships
  controls: 'CONTROLS_RESOURCE',
  owns: 'CONTROLS_RESOURCE',
  possesses: 'CONTROLS_RESOURCE',
  'allied with': 'IS_ALLY_OF',
  allies: 'IS_ALLY_OF',
  'partner of': 'IS_ALLY_OF',

  // Character relationships
  'member of': 'MEMBER_OF',
  'belongs to': 'MEMBER_OF',
  serves: 'MEMBER_OF',
  leads: 'COMMANDS',
  commands: 'COMMANDS',
  heads: 'COMMANDS',
  'participated in': 'PARTICIPATED_IN',
  'fought in': 'PARTICIPATED_IN',
  attended: 'PARTICIPATED_IN',

  // Location relationships
  'located in': 'LOCATED_IN',
  'situated in': 'LOCATED_IN',
  'found in': 'LOCATED_IN',
};

/**
 * Define (classify) extracted entities against the knowledge graph ontology
 * Implements the "Define" step of the EDC pattern
 */
export function classifyEntities(extractedEntities: ExtractedEntity[]): ClassifiedEntity[] {
  return extractedEntities.map((entity, index) => {
    const canonicalType = ONTOLOGY_MAPPING[entity.type] || entity.type;

    return {
      id: `temp_${entity.type.toLowerCase()}_${index}_${Date.now()}`,
      type: entity.type,
      canonicalType,
      attributes: entity.attributes,
      confidence: entity.confidence,
    };
  });
}

/**
 * Normalize relationship type to canonical format
 */
export function normalizeRelationshipType(rawType: string): string {
  const normalized = rawType.toLowerCase().trim();

  // Check for exact matches
  if (RELATIONSHIP_MAPPING[normalized]) {
    return RELATIONSHIP_MAPPING[normalized];
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(RELATIONSHIP_MAPPING)) {
    if (normalized.includes(key)) {
      return value;
    }
  }

  // Default to uppercased snake_case
  return normalized.toUpperCase().replace(/\s+/g, '_');
}

/**
 * Validate entity attributes against schema requirements
 */
export function validateEntityAttributes(
  type: string,
  attributes: Record<string, unknown>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  switch (type) {
    case 'Faction':
      if (!attributes.name) errors.push('Faction requires name attribute');
      if (!attributes.alignment) errors.push('Faction requires alignment attribute');
      break;

    case 'Character':
      if (!attributes.name) errors.push('Character requires name attribute');
      if (!attributes.role) errors.push('Character requires role attribute');
      break;

    case 'Location':
      if (!attributes.name) errors.push('Location requires name attribute');
      if (!attributes.type) errors.push('Location requires type attribute');
      break;

    case 'Resource':
      if (!attributes.name) errors.push('Resource requires name attribute');
      if (!attributes.type) errors.push('Resource requires type attribute');
      break;

    case 'Event':
      if (!attributes.name) errors.push('Event requires name attribute');
      if (!attributes.type) errors.push('Event requires type attribute');
      if (!attributes.date) errors.push('Event requires date attribute');
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
