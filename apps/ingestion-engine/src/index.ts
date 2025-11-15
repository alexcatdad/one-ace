import { createLogger } from '@ace/shared-logging';
import type { Context, Next } from 'hono';
import { Hono } from 'hono';
import type { WorkerJob, WorkerResult } from './types';
import { IngestionRequestSchema } from './types';

const logger = createLogger('ingestion-engine');

const worker = new Worker(new URL('./worker.ts', import.meta.url).href, {
  type: 'module',
});

// Store job results for status queries
const jobResults = new Map<string, unknown>();

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
  try {
    const body = await c.req.json().catch(() => ({}));

    // Validate request using Zod schema
    const parseResult = IngestionRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return c.json(
        {
          error: 'Invalid request',
          details: parseResult.error.issues,
        },
        400,
      );
    }

    const jobId = crypto.randomUUID();
    const job: WorkerJob = {
      id: jobId,
      request: parseResult.data,
    };

    worker.postMessage(job);
    logger.info('ingestion job queued', {
      jobId,
      textLength: parseResult.data.text.length,
    });

    return c.json(
      {
        message: 'Ingestion job accepted and processing via EDC pipeline',
        jobId,
        pipeline: ['Extract', 'Define', 'Canonicalize', 'Write to Graph'],
      },
      202,
    );
  } catch (error) {
    logger.error('Failed to process ingestion request', { error });
    return c.json(
      {
        error: 'Internal server error',
      },
      500,
    );
  }
});

app.get('/jobs/:jobId', (c: Context) => {
  const jobId = c.req.param('jobId');
  const result = jobResults.get(jobId);

  if (!result) {
    return c.json(
      {
        error: 'Job not found',
        jobId,
      },
      404,
    );
  }

  return c.json(result);
});

worker.onmessage = (event: MessageEvent<WorkerResult>) => {
  const { jobId, result } = event.data;
  jobResults.set(jobId, result);

  logger.info('ingestion job completed', {
    jobId,
    status: result.status,
    entitiesCreated: result.entitiesCreated,
    relationshipsCreated: result.relationshipsCreated,
    totalTimeMs: result.totalTimeMs,
  });

  // Clean up old job results after 1 hour
  setTimeout(() => jobResults.delete(jobId), 60 * 60 * 1000);
};

const port = Number(Bun.env.INGESTION_ENGINE_PORT ?? 3200);

Bun.serve({
  fetch: app.fetch,
  port,
});

logger.info('Ingestion engine listening', {
  port,
  ollamaHost: Bun.env.OLLAMA_HOST || 'http://localhost:11434',
});
