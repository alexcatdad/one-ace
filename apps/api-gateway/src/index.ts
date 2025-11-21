import { FactionSchema } from '@ace/core-types';
import { createLogger } from '@ace/shared-logging';
import type { Context, Next } from 'hono';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const logger = createLogger('api-gateway');

const app = new Hono();

// CORS middleware - allow web UI to make requests
app.use(
  '*',
  cors({
    origin: ['http://localhost:3500', 'http://127.0.0.1:3500'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// Request logging middleware
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

// Health check
app.get('/health', (c: Context) =>
  c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }),
);

// Schema discovery
app.get('/schemas/faction', (c: Context) =>
  c.json({
    fields: Object.keys(FactionSchema.shape),
  }),
);

// Proxy to ingestion engine
app.post('/ingest', async (c: Context) => {
  const ingestionUrl = Bun.env.INGESTION_ENGINE_URL || 'http://localhost:3200';
  const body = await c.req.json();

  try {
    const response = await fetch(`${ingestionUrl}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      return c.json(data, 202);
    }
    return c.json(data, 500);
  } catch (error) {
    logger.error('Error proxying to ingestion engine', { error });
    return c.json({ error: 'Ingestion service unavailable' }, 503);
  }
});

app.get('/jobs/:jobId', async (c: Context) => {
  const ingestionUrl = Bun.env.INGESTION_ENGINE_URL || 'http://localhost:3200';
  const jobId = c.req.param('jobId');

  try {
    const response = await fetch(`${ingestionUrl}/jobs/${jobId}`);
    const data = await response.json();

    if (response.ok) {
      return c.json(data, 200);
    }
    return c.json(data, 404);
  } catch (error) {
    logger.error('Error proxying to ingestion engine', { error });
    return c.json({ error: 'Ingestion service unavailable' }, 503);
  }
});

const port = Number(Bun.env.API_GATEWAY_PORT ?? 3000);

Bun.serve({
  fetch: app.fetch,
  port,
});

logger.info('API Gateway listening', { port });
