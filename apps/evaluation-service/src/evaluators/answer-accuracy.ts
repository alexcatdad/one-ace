import type { AnswerAccuracyResult } from '@ace/core-types';
import { Ollama } from 'ollama';

/**
 * Answer Accuracy Evaluator
 * Combines semantic similarity with factual consistency
 * Used when expected output is available (golden dataset tests)
 */

const ollama = new Ollama({
  host: Bun.env.OLLAMA_HOST || 'http://localhost:11434',
});

const ACCURACY_PROMPT = `You are an evaluator measuring answer quality against expected output.

Your task: Compare the Generated Answer with the Expected Answer.

Query:
{query}

Expected Answer (Ground Truth):
{expected_answer}

Generated Answer:
{generated_answer}

Instructions:
1. Semantic Similarity: How similar is the meaning? (0.0 to 1.0)
   - 1.0 = Identical meaning
   - 0.8-0.9 = Very similar, minor differences
   - 0.6-0.7 = Similar core meaning, some differences
   - 0.4-0.5 = Partially similar
   - 0.0-0.3 = Very different

2. Factual Consistency: Are all facts correct? (0.0 to 1.0)
   - 1.0 = All facts match
   - 0.5 = Some facts match, some differ
   - 0.0 = Facts contradict

Output Format (JSON):
{
  "semanticSimilarity": 0.85,
  "factualConsistency": 0.95,
  "reasoning": "Generated answer conveys the same core information with slightly different wording. All key facts are accurate."
}`;

export async function evaluateAnswerAccuracy(
  generatedText: string,
  expectedOutput: string,
  query: string,
): Promise<AnswerAccuracyResult> {
  const startTime = Date.now();

  try {
    const prompt = ACCURACY_PROMPT.replace('{query}', query)
      .replace('{expected_answer}', expectedOutput)
      .replace('{generated_answer}', generatedText);

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
    const semanticSimilarity = Math.max(0, Math.min(1, Number(result.semanticSimilarity) || 0));
    const factualConsistency = Math.max(0, Math.min(1, Number(result.factualConsistency) || 0));
    const reasoning = String(result.reasoning || 'No reasoning provided');

    // Overall accuracy is weighted average (factual consistency is more important)
    const score = factualConsistency * 0.7 + semanticSimilarity * 0.3;

    return {
      score,
      semanticSimilarity,
      factualConsistency,
      reasoning,
      evaluationTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Answer accuracy evaluation failed:', error);

    return {
      score: 0,
      semanticSimilarity: 0,
      factualConsistency: 0,
      reasoning: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      evaluationTimeMs: Date.now() - startTime,
    };
  }
}
