import { createLogger } from '@ace/shared-logging';
import type { Context, Next } from 'hono';
import { Hono } from 'hono';

const logger = createLogger('ingestion-engine');

const worker = new Worker(new URL('./worker.ts', import.meta.url).href, {
  type: 'module',
});

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
    service: 'ingestion-engine',
    timestamp: new Date().toISOString(),
  }),
);

app.post('/ingest', async (c: Context) => {
  const payload = await c.req.json().catch(() => ({}));
  const jobId = crypto.randomUUID();
  worker.postMessage({ id: jobId, payload });
  logger.info('ingestion job queued', { jobId });

  return c.json(
    {
      message: 'Ingestion job accepted',
      jobId,
    },
    202,
  );
});

worker.onmessage = (event) => {
  logger.info('ingestion job completed', event.data);
};

const port = Number(Bun.env.INGESTION_ENGINE_PORT ?? 3200);

Bun.serve({
  fetch: app.fetch,
  port,
});

logger.info('Ingestion engine listening', { port });
