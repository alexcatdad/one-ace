import { createLogger } from '@ace/shared-logging';
import type { Context, Next } from 'hono';
import { Hono } from 'hono';

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
  const payload = await c.req.json().catch(() => ({}));
  logger.info('workflow request received', { payload });

  return c.json({
    message: 'Workflow execution stub',
    received: payload,
  });
});

const port = Number(Bun.env.INFERENCE_SERVICE_PORT ?? 3100);

Bun.serve({
  fetch: app.fetch,
  port,
});

logger.info('Inference service listening', { port });
