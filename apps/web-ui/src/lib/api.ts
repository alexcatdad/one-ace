/**
 * API client for ACE backend services
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Ingestion API - Submit fantasy lore text for processing
 */
export interface IngestionRequest {
  text: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
}

export interface IngestionJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'partial' | 'failed';
  entitiesCreated?: number;
  relationshipsCreated?: number;
  extractionTimeMs?: number;
  defineTimeMs?: number;
  canonicalizeTimeMs?: number;
  graphWriteTimeMs?: number;
  totalTimeMs?: number;
  errors?: string[];
}

export async function submitLore(request: IngestionRequest): Promise<{ jobId: string }> {
  const response = await apiClient.post<{ jobId: string }>('/ingest', request);
  return response.data;
}

export async function getJobStatus(jobId: string): Promise<IngestionJob> {
  const response = await apiClient.get<IngestionJob>(`/jobs/${jobId}`);
  return response.data;
}

/**
 * Knowledge Graph API - Query entities and relationships
 */
export interface Entity {
  id: string;
  type: 'Faction' | 'Character' | 'Location' | 'Resource' | 'Event';
  properties: Record<string, unknown>;
}

export interface Relationship {
  id: string;
  type: string;
  fromId: string;
  toId: string;
  properties?: Record<string, unknown>;
}

export interface GraphData {
  entities: Entity[];
  relationships: Relationship[];
}

export async function getGraph(): Promise<GraphData> {
  const response = await apiClient.get<GraphData>('/graph');
  return response.data;
}

export async function getEntityById(id: string): Promise<Entity | null> {
  try {
    const response = await apiClient.get<Entity>(`/entities/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getEntitiesByType(type: Entity['type']): Promise<Entity[]> {
  const response = await apiClient.get<Entity[]>(`/entities?type=${type}`);
  return response.data;
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  const response = await apiClient.get<{ status: string; timestamp: string }>('/health');
  return response.data;
}
