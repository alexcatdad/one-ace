import { EvaluationRequestSchema } from '@ace/core-types';
import { createLogger } from '@ace/shared-logging';
import type { Context, Next } from 'hono';
import { Hono } from 'hono';
import { runEvaluation, runRegressionTests } from './evaluator';

const logger = createLogger('evaluation-service');

const app = new Hono();

app.use('*', async (c: Context, next: Next) => {
  const start = Date.now();
  await next();
  logger.info('request complete', {
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    durationMs: Date.now() - start,
  });
});

app.get('/health', (c: Context) =>
  c.json({
    status: 'ok',
    service: 'evaluation-service',
    timestamp: new Date().toISOString(),
  }),
);

// Evaluate a single request
app.post('/evaluate', async (c: Context) => {
  try {
    const body = await c.req.json();
    const request = EvaluationRequestSchema.parse(body);

    logger.info('evaluation request received', { testCaseId: request.testCaseId });

    const result = await runEvaluation(request);

    return c.json(result);
  } catch (error) {
    logger.error('evaluation failed', { error });
    return c.json(
      {
        error: 'Evaluation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
});

// Run full regression test suite
app.post('/regression', async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const version = (body as { version?: string }).version || 'v1';

    logger.info('regression test run started', { version });

    const report = await runRegressionTests(version);

    return c.json(report);
  } catch (error) {
    logger.error('regression test run failed', { error });
    return c.json(
      {
        error: 'Regression test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
});

// Get golden dataset metadata
app.get('/golden-dataset/:version', async (c: Context) => {
  try {
    const version = c.req.param('version') || 'v1';
    const filePath = `${import.meta.dir}/../golden-dataset/${version}.json`;
    const file = Bun.file(filePath);
    const content = await file.json();

    return c.json({
      version: content.version,
      description: content.description,
      metadata: content.metadata,
    });
  } catch (error) {
    logger.error('failed to load golden dataset', { error });
    return c.json(
      {
        error: 'Failed to load golden dataset',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      404,
    );
  }
});

const port = Number(Bun.env.EVALUATION_SERVICE_PORT ?? 3300);

Bun.serve({
  fetch: app.fetch,
  port,
});

logger.info('Evaluation service listening', { port });
