import { z } from 'zod';

import { EventType } from '../enums';

const SourcePerspectiveSchema = z.object({
  source: z.string().min(1, 'Source identifier is required'),
  perspective: z
    .string()
    .min(1, 'Perspective narrative is required')
    .describe('Narrative describing the source’s viewpoint of the event'),
});

export const EventSchema = z
  .object({
    id: z.string().min(1, 'Event id is required'),
    name: z.string().min(1, 'Event name is required'),
    type: z.nativeEnum(EventType),
    date: z
      .string()
      .min(1)
      .refine((value) => !Number.isNaN(Date.parse(value)), 'Date must be ISO 8601 compliant'),
    participants: z.array(z.string()).min(1, 'At least one participant is required'),
    consequences: z
      .string()
      .min(1, 'Consequences narrative is required')
      .describe('Describes the immediate and long-term consequences of the event'),
    source_perspective: z
      .array(SourcePerspectiveSchema)
      .min(1, 'At least one source perspective is required')
      .describe('Captures multiple viewpoints for the same historical event'),
  })
  .describe('Structured representation of a historical event with multi-perspective support');

export type HistoricalEvent = z.infer<typeof EventSchema>;
