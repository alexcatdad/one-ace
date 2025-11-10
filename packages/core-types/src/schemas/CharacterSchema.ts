import { z } from 'zod';

import { RelationshipType } from '../enums';

const CharacterRelationshipSchema = z.object({
  character_id: z.string().min(1, 'Related character id is required'),
  type: z.nativeEnum(RelationshipType),
  description: z
    .string()
    .min(1, 'Relationship description is required')
    .describe('Narrative context explaining the relationship'),
});

export const CharacterSchema = z
  .object({
    id: z.string().min(1, 'Character id is required'),
    name: z.string().min(1, 'Character name is required'),
    faction_affiliation: z.string().min(1, 'Affiliated faction id is required'),
    role: z.string().min(1, 'Character role is required'),
    relationships: z
      .array(CharacterRelationshipSchema)
      .describe('Relationships this character has with other entities'),
    historical_events: z
      .array(z.string())
      .describe('Identifiers of events this character participated in'),
  })
  .describe('Structured representation of a character and their relationships');

export type Character = z.infer<typeof CharacterSchema>;
