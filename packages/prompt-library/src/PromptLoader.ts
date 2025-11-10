import { join } from 'node:path';

const ROLE_DIRECTORY_MAP = {
  historian: 'historian',
  narrator: 'narrator',
  'consistency-checker': 'consistency-checker',
  kgc: 'kgc',
} as const;

export type PromptRole = keyof typeof ROLE_DIRECTORY_MAP;

export class PromptLoader {
  constructor(private readonly basePath: string = join(import.meta.dir, '..')) {}

  async loadPrompt(role: PromptRole, version: string): Promise<string> {
    const directory = ROLE_DIRECTORY_MAP[role];
    if (!directory) {
      throw new Error(
        `Unsupported role "${role}". Supported roles: ${Object.keys(ROLE_DIRECTORY_MAP).join(', ')}`,
      );
    }

    const filePath = join(this.basePath, directory, `${role}-v${version}.txt`);
    const promptFile = Bun.file(filePath);

    if (!(await promptFile.exists())) {
      throw new Error(
        `Prompt file not found for role "${role}" version "${version}" at ${filePath}`,
      );
    }

    return promptFile.text();
  }
}

export const promptLoader = new PromptLoader();
