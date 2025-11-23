import { createLogger } from '@ace/shared-logging';
import type { Context, Next } from 'hono';
import { Hono } from 'hono';
import { executeWorkflow } from './agents/workflow';

const logger = createLogger('inference-service');

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
    service: 'inference-service',
    timestamp: new Date().toISOString(),
  }),
);

app.post('/workflow/run', async (c: Context) => {
  try {
    const payload = await c.req.json();
    const { query, sessionId } = payload;

    if (!query) {
      return c.json({ error: 'Query is required' }, 400);
    }

    logger.info('workflow request received', { query, sessionId });

    // Execute the LangGraph workflow
    const result = await executeWorkflow(query, sessionId);

    logger.info('workflow completed', {
      success: result.success,
      iterations: result.iterations,
      errors: result.errors.length,
    });

    return c.json(result);
  } catch (error) {
    logger.error('workflow execution failed', { error });
    return c.json(
      {
        error: 'Workflow execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
});

const port = Number(Bun.env.INFERENCE_SERVICE_PORT ?? 3100);

Bun.serve({
  fetch: app.fetch,
  port,
});

logger.info('Inference service listening', { port });
