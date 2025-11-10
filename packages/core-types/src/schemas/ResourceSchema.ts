import { z } from 'zod';

import { ResourceType } from '../enums';

export const ResourceSchema = z
  .object({
    id: z.string().min(1, 'Resource id is required'),
    name: z.string().min(1, 'Resource name is required'),
    type: z.nativeEnum(ResourceType),
    location: z.string().min(1, 'Location identifier is required'),
    controlling_faction: z.string().min(1, 'Controlling faction id is required'),
    strategic_value: z
      .number()
      .int()
      .min(0)
      .max(100)
      .describe('Strategic importance on a scale from 0 (low) to 100 (critical)'),
  })
  .describe('Structured representation of a resource within the ACE knowledge graph');

export type Resource = z.infer<typeof ResourceSchema>;
