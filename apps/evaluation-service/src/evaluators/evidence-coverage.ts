import type { EvidenceCoverageResult } from '@ace/core-types';
import { Ollama } from 'ollama';

/**
 * Evidence Coverage Evaluator
 * Measures how much of the available context was utilized in the response
 * Ensures completeness of answers
 */

const ollama = new Ollama({
  host: Bun.env.OLLAMA_HOST || 'http://localhost:11434',
});

const COVERAGE_PROMPT = `You are an evaluator measuring evidence coverage in AI responses.

Your task: Identify which evidence points from the Context were used in the Generated Text.

Context (Available Evidence):
{context}

Generated Text:
{generated_text}

Query (User Question):
{query}

Instructions:
1. Extract all relevant evidence points from the Context that could answer the Query
2. Determine which evidence points were covered in the Generated Text
3. Identify missed evidence points that should have been included
4. Assess if the response is complete given the available context

Output Format (JSON):
{
  "totalEvidencePoints": 5,
  "coveredPoints": 4,
  "missedPoints": [
    "The Ruby Mines produce 500kg of rubies annually (relevant but not mentioned)"
  ],
  "reasoning": "Response covered most key facts about the Crimson Empire's resources but missed production quantities."
}

Be thorough: Only count evidence that directly answers the user's query.`;

export async function evaluateEvidenceCoverage(
  generatedText: string,
  retrievedContext: string,
  query: string,
): Promise<EvidenceCoverageResult> {
  const startTime = Date.now();

  try {
    const prompt = COVERAGE_PROMPT.replace('{context}', retrievedContext)
      .replace('{generated_text}', generatedText)
      .replace('{query}', query);

    const response = await ollama.chat({
      model: 'llama3.2:3b',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      format: 'json',
      options: {
        temperature: 0.1,
        top_p: 0.9,
      },
    });

    const rawContent = response.message.content;
    let parsed: unknown;
    parsed = JSON.parse(rawContent);

    const result = parsed as Record<string, unknown>;
    const totalEvidencePoints = Number(result.totalEvidencePoints) || 0;
    const coveredPoints = Number(result.coveredPoints) || 0;
    const missedPoints = Array.isArray(result.missedPoints)
      ? result.missedPoints.map((p) => String(p))
      : [];
    const reasoning = String(result.reasoning || 'No reasoning provided');

    const score = totalEvidencePoints > 0 ? coveredPoints / totalEvidencePoints : 1.0;

    return {
      score,
      totalEvidencePoints,
      coveredPoints,
      missedPoints,
      reasoning,
      evaluationTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Evidence coverage evaluation failed:', error);

    return {
      score: 0,
      totalEvidencePoints: 1,
      coveredPoints: 0,
      missedPoints: ['Evaluation failed'],
      reasoning: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      evaluationTimeMs: Date.now() - startTime,
    };
  }
}
