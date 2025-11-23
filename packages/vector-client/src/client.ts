/**
 * Vector database client for semantic search using Qdrant and Ollama embeddings
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import { Ollama } from 'ollama';
import type {
  EmbeddingResult,
  UpsertResult,
  VectorDocument,
  VectorSearchOptions,
  VectorSearchResult,
} from './types';

export class VectorClient {
  private qdrant: QdrantClient;
  private ollama: Ollama;
  private collectionName: string;
  private embeddingModel: string;
  private embeddingDimension: number;

  constructor(
    qdrantUrl: string,
    ollamaHost: string,
    collectionName = 'ace-lore',
    embeddingModel = 'nomic-embed-text',
    embeddingDimension = 768,
  ) {
    this.qdrant = new QdrantClient({ url: qdrantUrl });
    this.ollama = new Ollama({ host: ollamaHost });
    this.collectionName = collectionName;
    this.embeddingModel = embeddingModel;
    this.embeddingDimension = embeddingDimension;
  }

  /**
   * Initialize the collection if it doesn't exist
   */
  async initialize(): Promise<void> {
    try {
      const collections = await this.qdrant.getCollections();
      const exists = collections.collections.some((c) => c.name === this.collectionName);

      if (!exists) {
        await this.qdrant.createCollection(this.collectionName, {
          vectors: {
            size: this.embeddingDimension,
            distance: 'Cosine',
          },
        });
        console.log(`[vector-client] Created collection: ${this.collectionName}`);
      } else {
        console.log(`[vector-client] Collection already exists: ${this.collectionName}`);
      }
    } catch (error) {
      console.error('[vector-client] Error initializing collection:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for text using Ollama
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const startTime = Date.now();

    try {
      const response = await this.ollama.embeddings({
        model: this.embeddingModel,
        prompt: text,
      });

      return {
        embedding: response.embedding,
        model: this.embeddingModel,
        embeddingTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error('[vector-client] Error generating embedding:', error);
      throw new Error(
        `Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Upsert documents into the vector database
   */
  async upsertDocuments(documents: VectorDocument[]): Promise<UpsertResult> {
    try {
      const points = await Promise.all(
        documents.map(async (doc) => {
          const { embedding } = await this.generateEmbedding(doc.text);

          return {
            id: doc.id,
            vector: embedding,
            payload: {
              text: doc.text,
              ...doc.metadata,
            },
          };
        }),
      );

      const result = await this.qdrant.upsert(this.collectionName, {
        wait: true,
        points,
      });

      console.log(
        `[vector-client] Upserted ${documents.length} documents to ${this.collectionName}`,
      );

      return result as UpsertResult;
    } catch (error) {
      console.error('[vector-client] Error upserting documents:', error);
      throw error;
    }
  }

  /**
   * Search for similar documents using vector similarity
   */
  async search(query: string, options: VectorSearchOptions = {}): Promise<VectorSearchResult[]> {
    const { limit = 5, scoreThreshold = 0.7, filter } = options;

    try {
      // Generate query embedding
      const { embedding } = await this.generateEmbedding(query);

      // Search in Qdrant
      const searchResult = await this.qdrant.search(this.collectionName, {
        vector: embedding,
        limit,
        score_threshold: scoreThreshold,
        filter,
      });

      return searchResult.map((result) => ({
        id: String(result.id),
        score: result.score,
        payload: result.payload || {},
      }));
    } catch (error) {
      console.error('[vector-client] Error searching:', error);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  async getById(id: string): Promise<VectorSearchResult | null> {
    try {
      const result = await this.qdrant.retrieve(this.collectionName, {
        ids: [id],
        with_payload: true,
        with_vector: false,
      });

      if (result.length === 0) {
        return null;
      }

      const doc = result[0];
      if (!doc) {
        return null;
      }

      return {
        id: String(doc.id),
        score: 1.0, // Direct retrieval has perfect score
        payload: doc.payload || {},
      };
    } catch (error) {
      console.error('[vector-client] Error retrieving by ID:', error);
      throw error;
    }
  }

  /**
   * Delete documents by IDs
   */
  async deleteByIds(ids: string[]): Promise<void> {
    try {
      await this.qdrant.delete(this.collectionName, {
        wait: true,
        points: ids,
      });

      console.log(`[vector-client] Deleted ${ids.length} documents from ${this.collectionName}`);
    } catch (error) {
      console.error('[vector-client] Error deleting documents:', error);
      throw error;
    }
  }

  /**
   * Get collection info
   */
  async getCollectionInfo() {
    try {
      return await this.qdrant.getCollection(this.collectionName);
    } catch (error) {
      console.error('[vector-client] Error getting collection info:', error);
      throw error;
    }
  }
}

/**
 * Create a singleton vector client instance
 */
let vectorClientInstance: VectorClient | null = null;

export function getVectorClient(): VectorClient {
  if (!vectorClientInstance) {
    const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';

    vectorClientInstance = new VectorClient(qdrantUrl, ollamaHost);
  }

  return vectorClientInstance;
}

export function resetVectorClient(): void {
  vectorClientInstance = null;
}
