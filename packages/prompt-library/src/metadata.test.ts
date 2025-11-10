import { describe, expect, it } from 'bun:test';

import { promptMetadataRegistry } from './metadata';

describe('PromptMetadataRegistry', () => {
  it('records prompt usage with validated metadata', () => {
    const record = promptMetadataRegistry.recordUsage(
      {
        prompt_id: 'historian-v1.0.0',
        version: '1.0.0',
        agent_role: 'historian',
        timestamp: new Date().toISOString(),
        hash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      },
      'output-123',
    );

    expect(record.output_id).toBe('output-123');
    expect(promptMetadataRegistry.findByPromptId('historian-v1.0.0')).toHaveLength(1);
  });
});
