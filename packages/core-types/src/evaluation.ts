import { z } from 'zod';

/**
 * Evaluation Metrics for RAG System Quality Assessment
 * Based on specs/architecture_blueprint.md Section 5.2-5.3
 */

// Golden Dataset Test Case Schema
export const GoldenTestCaseSchema = z.object({
  id: z.string(),
  version: z.string(),
  category: z.enum(['retrieval', 'generation', 'consistency', 'edge_case']),
  input: z.object({
    query: z.string(),
    context: z.string().optional(), // Pre-defined context for controlled tests
    expectedEntities: z.array(z.string()).optional(),
    expectedRelationships: z.array(z.string()).optional(),
  }),
  expectedOutput: z.object({
    text: z.string().optional(), // Expected response text (for semantic similarity)
    mustInclude: z.array(z.string()).optional(), // Required facts/entities
    mustNotInclude: z.array(z.string()).optional(), // Prohibited content
    minFaithfulness: z.number().min(0).max(1).default(0.97),
    minEvidenceCoverage: z.number().min(0).max(1).default(0.8),
  }),
  metadata: z.object({
    createdBy: z.string(),
    createdAt: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

export type GoldenTestCase = z.infer<typeof GoldenTestCaseSchema>;

// Faithfulness Evaluation Result
export const FaithfulnessResultSchema = z.object({
  score: z.number().min(0).max(1),
  claims: z.array(
    z.object({
      statement: z.string(),
      grounded: z.boolean(),
      evidence: z.string().optional(), // Supporting evidence from context
      reasoning: z.string(),
    }),
  ),
  totalClaims: z.number(),
  groundedClaims: z.number(),
  ungroundedClaims: z.number(),
  evaluationTimeMs: z.number(),
});

export type FaithfulnessResult = z.infer<typeof FaithfulnessResultSchema>;

// Evidence Coverage Evaluation Result
export const EvidenceCoverageResultSchema = z.object({
  score: z.number().min(0).max(1),
  totalEvidencePoints: z.number(),
  coveredPoints: z.number(),
  missedPoints: z.array(z.string()),
  reasoning: z.string(),
  evaluationTimeMs: z.number(),
});

export type EvidenceCoverageResult = z.infer<typeof EvidenceCoverageResultSchema>;

// Answer Accuracy Result
export const AnswerAccuracyResultSchema = z.object({
  score: z.number().min(0).max(1),
  semanticSimilarity: z.number().min(0).max(1),
  factualConsistency: z.number().min(0).max(1),
  reasoning: z.string(),
  evaluationTimeMs: z.number(),
});

export type AnswerAccuracyResult = z.infer<typeof AnswerAccuracyResultSchema>;

// Comprehensive Evaluation Result
export const EvaluationResultSchema = z.object({
  testCaseId: z.string(),
  passed: z.boolean(),
  faithfulness: FaithfulnessResultSchema,
  evidenceCoverage: EvidenceCoverageResultSchema,
  answerAccuracy: AnswerAccuracyResultSchema.optional(),
  overallScore: z.number().min(0).max(1),
  errors: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  evaluationTimeMs: z.number(),
  timestamp: z.string(),
});

export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;

// Regression Test Report
export const RegressionReportSchema = z.object({
  runId: z.string(),
  timestamp: z.string(),
  totalTests: z.number(),
  passed: z.number(),
  failed: z.number(),
  averageFaithfulness: z.number(),
  averageEvidenceCoverage: z.number(),
  averageOverallScore: z.number(),
  results: z.array(EvaluationResultSchema),
  summary: z.object({
    criticalFailures: z.array(z.string()),
    warnings: z.array(z.string()),
    recommendation: z.enum(['PASS', 'FAIL', 'REVIEW_REQUIRED']),
  }),
  durationMs: z.number(),
});

export type RegressionReport = z.infer<typeof RegressionReportSchema>;

// Evaluation Request Schema
export const EvaluationRequestSchema = z.object({
  generatedText: z.string(),
  retrievedContext: z.string(),
  query: z.string(),
  expectedOutput: z.string().optional(),
  testCaseId: z.string().optional(),
});

export type EvaluationRequest = z.infer<typeof EvaluationRequestSchema>;
