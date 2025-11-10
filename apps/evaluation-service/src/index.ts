import { createLogger } from '@ace/shared-logging';
import type { Context, Next } from 'hono';
import { Hono } from 'hono';

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

app.post('/evaluate', async (c: Context) => {
  const payload = await c.req.json().catch(() => ({}));
  logger.info('evaluation request received', { payload });

  return c.json({
    faithfulness: 1,
    evidenceCoverage: 1,
    notes: ['Evaluation service stub'],
  });
});

const port = Number(Bun.env.EVALUATION_SERVICE_PORT ?? 3300);

Bun.serve({
  fetch: app.fetch,
  port,
});

logger.info('Evaluation service listening', { port });
