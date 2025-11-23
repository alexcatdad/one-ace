/**
 * Narrator Agent - Generates new lore based on retrieved context
 * Uses Ollama LLM with structured output
 */

import { PromptLoader } from '@ace/prompt-library';
import { Ollama } from 'ollama';
import type { GeneratedLore, WorkflowState } from './state';

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://localhost:11434',
});

/**
 * Narrator Agent: Generate consistent lore based on context
 */
export async function narratorAgent(state: WorkflowState): Promise<Partial<WorkflowState>> {
  const startTime = Date.now();
  console.log('[narrator] Starting lore generation');

  if (!state.retrievedContext) {
    return {
      errors: [...state.errors, 'No context available for lore generation'],
    };
  }

  try {
    // Load narrator prompt
    const promptLoader = new PromptLoader();
    const narratorPrompt = await promptLoader.loadPrompt('narrator', '1.0.0');

    // Build context summary
    const contextSummary = buildContextSummary(state);

    // Generate lore using Ollama
    const fullPrompt = `${narratorPrompt}

User Query: ${state.userQuery}

Retrieved Context:
${contextSummary}

Generate a response that:
1. Answers the user's query based on the retrieved context
2. Maintains consistency with existing lore
3. Extracts any new entities and relationships mentioned
4. Provides structured output in JSON format

Output format:
{
  "text": "The main response text addressing the query",
  "entities": [
    {
      "type": "Faction|Character|Location|Resource|Event",
      "name": "Entity name",
      "properties": { "key": "value" }
    }
  ],
  "relationships": [
    {
      "type": "RELATIONSHIP_TYPE",
      "from": "entity1_name",
      "to": "entity2_name"
    }
  ],
  "confidence": 0.85,
  "reasoning": "Brief explanation of how this fits with existing lore"
}`;

    console.log('[narrator] Calling Ollama LLM...');

    const response = await ollama.chat({
      model: 'llama3.2:3b',
      messages: [
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
      format: 'json',
      options: {
        temperature: 0.7, // More creative than extraction
        top_p: 0.9,
      },
    });

    const rawContent = response.message.content;
    console.log('[narrator] Raw LLM response:', rawContent.substring(0, 200));

    // Parse structured output
    let parsedOutput: unknown;
    try {
      parsedOutput = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('[narrator] Failed to parse JSON output:', parseError);
      return {
        errors: [
          ...state.errors,
          `Narrator output parsing failed: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`,
        ],
      };
    }

    const generatedLore: GeneratedLore = {
      text: (parsedOutput as any).text || '',
      entities: (parsedOutput as any).entities || [],
      relationships: (parsedOutput as any).relationships || [],
      confidence: (parsedOutput as any).confidence || 0.5,
      reasoning: (parsedOutput as any).reasoning || 'No reasoning provided',
      generationTimeMs: Date.now() - startTime,
    };

    console.log(
      `[narrator] Generated lore in ${generatedLore.generationTimeMs}ms: ${generatedLore.entities.length} entities, ${generatedLore.relationships.length} relationships`,
    );

    return {
      generatedLore,
      iterationCount: state.iterationCount + 1,
    };
  } catch (error) {
    console.error('[narrator] Error during lore generation:', error);
    return {
      errors: [
        ...state.errors,
        `Narrator error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
      iterationCount: state.iterationCount + 1,
    };
  }
}

/**
 * Build a text summary of retrieved context for the LLM
 */
function buildContextSummary(state: WorkflowState): string {
  const context = state.retrievedContext;
  if (!context) return 'No context available.';

  const parts: string[] = [];

  // Graph entities
  if (context.graphEntities.length > 0) {
    parts.push('**Existing Entities:**');
    for (const entity of context.graphEntities.slice(0, 10)) {
      const props = Object.entries(entity.properties)
        .filter(([k]) => k !== 'id' && k !== 'type')
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      parts.push(`- ${entity.type}: ${entity.id} (${props})`);
    }
  }

  // Graph relationships
  if (context.graphRelationships.length > 0) {
    parts.push('\n**Existing Relationships:**');
    for (const rel of context.graphRelationships.slice(0, 10)) {
      parts.push(`- ${rel.from} ${rel.type} ${rel.to}`);
    }
  }

  // Similar documents
  if (context.similarDocuments.length > 0) {
    parts.push('\n**Similar Lore:**');
    for (const doc of context.similarDocuments.slice(0, 3)) {
      parts.push(`- (Score: ${doc.score.toFixed(2)}) ${doc.text.substring(0, 200)}...`);
    }
  }

  parts.push(`\n**Relevance Score:** ${context.relevanceScore}`);

  return parts.join('\n');
}
