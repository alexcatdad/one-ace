import { describe, expect, it } from 'bun:test';
import { join } from 'node:path';

import { PromptLoader } from './PromptLoader';

const loader = new PromptLoader(join(import.meta.dir, '..'));

describe('PromptLoader', () => {
  it('loads an existing historian prompt', async () => {
    const prompt = await loader.loadPrompt('historian', '1.0.0');
    expect(prompt.length).toBeGreaterThan(100);
    expect(prompt).toContain('Historian Agent');
  });

  it('throws when the requested prompt does not exist', async () => {
    await expect(loader.loadPrompt('historian', '9.9.9')).rejects.toThrow(
      'Prompt file not found for role "historian" version "9.9.9"',
    );
  });

  it('rejects unsupported roles', async () => {
    // @ts-expect-error - testing runtime validation
    await expect(loader.loadPrompt('unknown', '1.0.0')).rejects.toThrow('Unsupported role');
  });
});
