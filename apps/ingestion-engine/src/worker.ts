/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = async (event: MessageEvent<{ id?: string; payload?: unknown }>) => {
  const job = event.data ?? {};
  console.log('[ingestion-worker] received job', job);

  await new Promise((resolve) => setTimeout(resolve, 100));

  self.postMessage({
    status: 'completed',
    jobId: job.id ?? crypto.randomUUID(),
  });
};

export {};
