import { z } from 'zod';

import { Alignment } from '../enums';

export const FactionSchema = z
  .object({
    id: z.string().min(1, 'Faction id is required'),
    name: z.string().min(1, 'Faction name is required'),
    alignment: z.nativeEnum(Alignment),
    core_motivation: z.string().min(1, 'Core motivation is required'),
    leader_name: z.string().min(1, 'Leader name is required'),
    controlled_resources: z.array(z.string()).describe('Resource IDs controlled by the faction'),
    relationship_to_hegemony: z
      .string()
      .describe('Narrative description of how this faction relates to the hegemony'),
    justification: z
      .string()
      .min(1, 'Justification narrative is required')
      .describe('Lore justification for the faction’s current alignment and motivations'),
  })
  .describe('Structured representation of a faction in the ACE knowledge graph');

export type Faction = z.infer<typeof FactionSchema>;
