/**
 * ACE Workflow Orchestration
 * Orchestrates Historian → Narrator → Consistency Checker agents with validation loops
 */

import { consistencyCheckerAgent } from './consistency-checker';
import { historianAgent } from './historian';
import { narratorAgent } from './narrator';
import type { WorkflowState } from './state';

/**
 * Execute the ACE workflow for a user query
 * Manual orchestration with validation loops
 */
export async function executeWorkflow(userQuery: string, sessionId?: string) {
  const initialState: WorkflowState = {
    userQuery,
    sessionId: sessionId || `session-${Date.now()}`,
    retrievedContext: null,
    generatedLore: null,
    validationResult: null,
    iterationCount: 0,
    maxIterations: 3,
    requiresHumanReview: false,
    errors: [],
  };

  console.log('[workflow] Starting ACE workflow for query:', userQuery);

  let state = { ...initialState };

  try {
    // Step 1: Historian - Retrieve context
    const historianResult = await historianAgent(state);
    state = { ...state, ...historianResult };

    if (!state.retrievedContext) {
      throw new Error('Historian failed to retrieve context');
    }

    // Step 2-4: Narrator + Consistency loop
    let isValid = false;
    while (!isValid && state.iterationCount < state.maxIterations) {
      // Step 2: Narrator - Generate lore
      const narratorResult = await narratorAgent(state);
      state = { ...state, ...narratorResult };

      if (!state.generatedLore) {
        throw new Error('Narrator failed to generate lore');
      }

      // Step 3: Consistency Checker - Validate
      const validationResult = await consistencyCheckerAgent(state);
      state = { ...state, ...validationResult };

      if (!state.validationResult) {
        throw new Error('Consistency checker failed');
      }

      isValid = state.validationResult.isValid;

      if (!isValid && state.iterationCount < state.maxIterations) {
        console.log(
          `[workflow] Validation failed (iteration ${state.iterationCount}). Retrying narrator...`,
        );
      }
    }

    // Determine final status
    if (!isValid && state.iterationCount >= state.maxIterations) {
      console.warn('[workflow] Max iterations reached without valid output');
      state.requiresHumanReview = true;
    }

    console.log(
      '[workflow] Workflow completed:',
      `Valid=${state.validationResult?.isValid}, ` +
        `Iterations=${state.iterationCount}, ` +
        `Errors=${state.errors.length}`,
    );

    return {
      success: state.validationResult?.isValid || false,
      response: state.generatedLore?.text || '',
      entities: state.generatedLore?.entities || [],
      relationships: state.generatedLore?.relationships || [],
      validationResult: state.validationResult,
      retrievedContext: state.retrievedContext,
      iterations: state.iterationCount,
      requiresHumanReview: state.requiresHumanReview,
      errors: state.errors,
    };
  } catch (error) {
    console.error('[workflow] Workflow execution failed:', error);
    return {
      success: false,
      response: '',
      entities: [],
      relationships: [],
      validationResult: null,
      retrievedContext: state.retrievedContext,
      iterations: state.iterationCount,
      requiresHumanReview: true,
      errors: [
        ...state.errors,
        `Workflow error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
}
