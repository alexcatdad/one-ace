import { type PromptMetadata, PromptMetadataSchema } from './types';

export interface PromptUsageRecord {
  prompt: PromptMetadata;
  output_id: string;
  input_hash?: string;
  created_at: string;
}

export class PromptMetadataRegistry {
  private readonly records: PromptUsageRecord[] = [];

  recordUsage(metadata: PromptMetadata, outputId: string, inputHash?: string): PromptUsageRecord {
    const parsedMetadata = PromptMetadataSchema.parse(metadata);
    const record: PromptUsageRecord = {
      prompt: parsedMetadata,
      output_id: outputId,
      input_hash: inputHash,
      created_at: new Date().toISOString(),
    };
    this.records.push(record);
    return record;
  }

  findByPromptId(promptId: string): PromptUsageRecord[] {
    return this.records.filter((record) => record.prompt.prompt_id === promptId);
  }

  all(): PromptUsageRecord[] {
    return [...this.records];
  }
}

export const promptMetadataRegistry = new PromptMetadataRegistry();
