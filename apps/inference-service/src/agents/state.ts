/**
 * State definitions for ACE LangGraph workflow
 * Tracks the progression through Historian → Narrator → Consistency Checker
 */

export interface WorkflowState {
  // Input
  userQuery: string;
  sessionId: string;

  // Historian Agent output
  retrievedContext: RetrievedContext | null;

  // Narrator Agent output
  generatedLore: GeneratedLore | null;

  // Consistency Checker output
  validationResult: ValidationResult | null;

  // Workflow control
  iterationCount: number;
  maxIterations: number;
  requiresHumanReview: boolean;
  errors: string[];
}

export interface RetrievedContext {
  // Graph-based retrieval
  graphEntities: Array<{
    id: string;
    type: string;
    properties: Record<string, unknown>;
  }>;
  graphRelationships: Array<{
    type: string;
    from: string;
    to: string;
    properties?: Record<string, unknown>;
  }>;

  // Vector-based retrieval
  similarDocuments: Array<{
    id: string;
    text: string;
    score: number;
    metadata: Record<string, unknown>;
  }>;

  // Analysis
  relevanceScore: number;
  retrievalTimeMs: number;
}

export interface GeneratedLore {
  // Main content
  text: string;
  entities: Array<{
    type: 'Faction' | 'Character' | 'Location' | 'Resource' | 'Event';
    name: string;
    properties: Record<string, unknown>;
  }>;
  relationships: Array<{
    type: string;
    from: string;
    to: string;
  }>;

  // Metadata
  confidence: number;
  reasoning: string;
  generationTimeMs: number;
}

export interface ValidationResult {
  isValid: boolean;
  schemaCompliant: boolean;
  consistencyScore: number;

  // Issues found
  schemaViolations: Array<{
    field: string;
    issue: string;
  }>;
  contradictions: Array<{
    newClaim: string;
    existingFact: string;
    conflictType: string;
  }>;

  // Recommendations
  suggestedFixes: string[];
  requiresRevision: boolean;
  validationTimeMs: number;
}

/**
 * Workflow decision outcomes
 */
export type WorkflowDecision =
  | 'proceed_to_narrator'
  | 'proceed_to_validation'
  | 'retry_narrator'
  | 'complete_success'
  | 'require_human_review'
  | 'max_iterations_reached';
