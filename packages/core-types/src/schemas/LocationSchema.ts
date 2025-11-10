import { z } from 'zod';

import { LocationType } from '../enums';

export const LocationSchema = z
  .object({
    id: z.string().min(1, 'Location id is required'),
    name: z.string().min(1, 'Location name is required'),
    type: z.nativeEnum(LocationType),
    climate: z.string().min(1, 'Climate description is required'),
    connected_locations: z
      .array(z.string())
      .describe('Identifiers for adjacent locations with direct travel paths'),
    controlling_faction: z
      .string()
      .min(1, 'Controlling faction id is required')
      .describe('Faction currently in control of the location'),
    resources: z.array(z.string()).describe('Identifiers for resources available at this location'),
  })
  .describe('Structured representation of a location including spatial connectivity');

export type Location = z.infer<typeof LocationSchema>;
