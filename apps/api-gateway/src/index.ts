import { FactionSchema } from '@ace/core-types';
import { createLogger } from '@ace/shared-logging';
import type { Context, Next } from 'hono';
import { Hono } from 'hono';

const logger = createLogger('api-gateway');

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
    timestamp: new Date().toISOString(),
  }),
);

app.get('/schemas/faction', (c: Context) =>
  c.json({
    fields: Object.keys(FactionSchema.shape),
  }),
);

const port = Number(Bun.env.API_GATEWAY_PORT ?? 3000);

Bun.serve({
  fetch: app.fetch,
  port,
});

logger.info('API Gateway listening', { port });
