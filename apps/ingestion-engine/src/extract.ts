import type { Ollama } from 'ollama';
import type { ExtractionResult, IngestionRequest } from './types';

/**
 * Extract entities and relationships from raw text using LLM
 * Implements the "Extract" step of the EDC pattern
 */
export async function extractEntitiesAndRelationships(
  request: IngestionRequest,
  ollama: Ollama,
): Promise<ExtractionResult> {
  const startTime = Date.now();

  const prompt = `You are an entity extraction system for a fantasy RPG world knowledge graph.

Extract all entities and relationships from the following text. Return ONLY valid JSON with no additional text.

Required JSON format:
{
  "entities": [
    {
      "type": "Faction" | "Character" | "Location" | "Resource" | "Event",
      "mentions": ["name1", "alias1"],
      "attributes": { "key": "value" },
      "confidence": 0.0-1.0
    }
  ],
  "relationships": [
    {
      "from": "entity mention",
      "to": "entity mention",
      "type": "relationship description",
      "evidence": "supporting text passage",
      "confidence": 0.0-1.0
    }
  ]
}

Entity types:
- Faction: Political groups, organizations, military forces
- Character: Named individuals
- Location: Cities, regions, strongholds
- Resource: Strategic assets (military, economic, technological)
- Event: Historical events, battles, treaties, discoveries

Text to analyze:
${request.text}

Extract all entities and relationships:`;

  try {
    const response = await ollama.generate({
      model: 'llama3.2:3b',
      prompt,
      format: 'json',
      options: {
        temperature: 0.3, // Lower temperature for more deterministic extraction
        num_predict: 2000,
      },
    });

    const parsed = JSON.parse(response.response);

    return {
      entities: parsed.entities || [],
      relationships: parsed.relationships || [],
      extractionTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error('[extract] LLM extraction failed:', error);
    return {
      entities: [],
      relationships: [],
      extractionTimeMs: Date.now() - startTime,
    };
  }
}
