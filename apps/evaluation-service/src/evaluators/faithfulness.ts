import type { FaithfulnessResult } from '@ace/core-types';
import { Ollama } from 'ollama';

/**
 * Faithfulness Evaluator (LLM-as-a-Judge)
 * Evaluates whether generated content is grounded in retrieved context
 * Target: ≥97% faithfulness score (specs/architecture_blueprint.md Section 6.4)
 */

const ollama = new Ollama({
  host: Bun.env.OLLAMA_HOST || 'http://localhost:11434',
});

// Faithfulness evaluation prompt template
const FAITHFULNESS_PROMPT = `You are an expert evaluator assessing the faithfulness of AI-generated content.

Your task: Analyze if EVERY claim in the Generated Text is supported by the Context.

Context (Retrieved Facts):
{context}

Generated Text:
{generated_text}

Instructions:
1. Extract all factual claims from the Generated Text
2. For each claim, determine if it is GROUNDED in the Context
3. A claim is GROUNDED if:
   - It is directly stated in the Context, OR
   - It can be logically inferred from facts in the Context
4. A claim is UNGROUNDED if:
   - It introduces new information not in the Context
   - It contradicts the Context
   - It makes assumptions beyond the Context

Output Format (JSON):
{
  "claims": [
    {
      "statement": "The Crimson Empire controls the Ruby Mines",
      "grounded": true,
      "evidence": "Context states: 'Emperor Valen annexed the Ruby Mines in Year 1205'",
      "reasoning": "Direct evidence of control relationship"
    }
  ]
}

Be strict: If in doubt, mark as ungrounded. Quality over lenience.`;

export async function evaluateFaithfulness(
  generatedText: string,
  retrievedContext: string,
): Promise<FaithfulnessResult> {
  const startTime = Date.now();

  try {
    const prompt = FAITHFULNESS_PROMPT.replace('{context}', retrievedContext).replace(
      '{generated_text}',
      generatedText,
    );

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
        temperature: 0.1, // Low temperature for consistency
        top_p: 0.9,
      },
    });

    const rawContent = response.message.content;
    const parsed: unknown = JSON.parse(rawContent);

    const claims = (parsed as { claims?: Array<unknown> }).claims || [];

    // Process claims and calculate score
    const processedClaims = claims.map((claim) => {
      const c = claim as Record<string, unknown>;
      return {
        statement: String(c.statement || ''),
        grounded: Boolean(c.grounded),
        evidence: c.evidence ? String(c.evidence) : undefined,
        reasoning: String(c.reasoning || 'No reasoning provided'),
      };
    });

    const totalClaims = processedClaims.length;
    const groundedClaims = processedClaims.filter((c) => c.grounded).length;
    const ungroundedClaims = totalClaims - groundedClaims;
    const score = totalClaims > 0 ? groundedClaims / totalClaims : 1.0;

    return {
      score,
      claims: processedClaims,
      totalClaims,
      groundedClaims,
      ungroundedClaims,
      evaluationTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Faithfulness evaluation failed:', error);

    // Return zero score on error
    return {
      score: 0,
      claims: [
        {
          statement: 'Evaluation failed',
          grounded: false,
          reasoning: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      totalClaims: 1,
      groundedClaims: 0,
      ungroundedClaims: 1,
      evaluationTimeMs: Date.now() - startTime,
    };
  }
}
