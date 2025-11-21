/**
 * Job Status Tracker - Monitor ingestion job progress
 */

import { useQuery } from '@tanstack/react-query';
import { getJobStatus } from '../lib/api';

export function JobStatus({ jobId }: { jobId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobStatus(jobId),
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling if job is completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });

  if (isLoading) {
    return (
      <div className="job-status">
        <p>Loading job status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-status" style={{ color: 'red' }}>
        <p>Error loading job: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const statusColors = {
    pending: '#FFA500',
    processing: '#2196F3',
    completed: '#4CAF50',
    partial: '#FF9800',
    failed: '#f44336',
  };

  const statusColor = statusColors[data.status];

  return (
    <div
      className="job-status"
      style={{
        padding: '16px',
        backgroundColor: '#fff',
        border: `2px solid ${statusColor}`,
        borderRadius: '8px',
        marginTop: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <h3 style={{ margin: 0 }}>Job {jobId.slice(0, 8)}...</h3>
        <span
          style={{
            padding: '4px 12px',
            backgroundColor: statusColor,
            color: 'white',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          {data.status}
        </span>
      </div>

      {data.status === 'completed' && (
        <div style={{ fontSize: '14px' }}>
          <p style={{ margin: '4px 0' }}>
            <strong>Entities created:</strong> {data.entitiesCreated || 0}
          </p>
          <p style={{ margin: '4px 0' }}>
            <strong>Relationships created:</strong> {data.relationshipsCreated || 0}
          </p>
          <p style={{ margin: '4px 0' }}>
            <strong>Total time:</strong> {data.totalTimeMs}ms
          </p>
          <details style={{ marginTop: '8px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Performance Breakdown
            </summary>
            <ul style={{ paddingLeft: '20px', fontSize: '13px' }}>
              <li>Extraction: {data.extractionTimeMs}ms</li>
              <li>Definition: {data.defineTimeMs}ms</li>
              <li>Canonicalization: {data.canonicalizeTimeMs}ms</li>
              <li>Graph Write: {data.graphWriteTimeMs}ms</li>
            </ul>
          </details>
        </div>
      )}

      {data.status === 'failed' && data.errors && (
        <div style={{ fontSize: '14px', color: '#d32f2f' }}>
          <strong>Errors:</strong>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            {data.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {data.status === 'processing' && (
        <div style={{ fontSize: '14px' }}>
          <p>Processing your lore... This may take a few moments.</p>
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#e0e0e0',
              borderRadius: '2px',
              overflow: 'hidden',
              marginTop: '8px',
            }}
          >
            <div
              style={{
                width: '30%',
                height: '100%',
                backgroundColor: statusColor,
                animation: 'progress 1.5s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
