import { z } from 'zod';

export const PromptVersionSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, 'Prompt version must follow semantic versioning (major.minor.patch)');

export const PromptMetadataSchema = z.object({
  prompt_id: z.string().min(1, 'Prompt identifier is required'),
  version: PromptVersionSchema,
  agent_role: z.string().min(1, 'Agent role is required'),
  timestamp: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Timestamp must be ISO 8601 compliant'),
  hash: z
    .string()
    .length(64, 'Hash must be a 64-character SHA-256 string')
    .describe('Integrity hash of the prompt content'),
});

export type PromptMetadata = z.infer<typeof PromptMetadataSchema>;
