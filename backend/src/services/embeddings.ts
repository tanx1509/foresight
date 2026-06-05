import crypto from 'crypto';

export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
}

export class MockEmbeddingProvider implements EmbeddingProvider {
  async generateEmbedding(text: string): Promise<number[]> {
    // Generate a mock 1536-dimensional embedding vector
    return new Array(1536).fill(0).map(() => Math.random() * 0.1);
  }
}

export class LocalEmbeddingProvider implements EmbeddingProvider {
  async generateEmbedding(text: string): Promise<number[]> {
    const hash = crypto.createHash('sha256').update(text).digest();
    let seed = hash.readUInt32LE(0);
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const vector = new Array(1536).fill(0).map(() => (random() * 2) - 1);
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / (magnitude || 1));
  }
}

export class AzureOpenAIEmbeddingProvider implements EmbeddingProvider {
  async generateEmbedding(text: string): Promise<number[]> {
    throw new Error("Not implemented: AzureOpenAIEmbeddingProvider requires Phase 3 Azure keys.");
  }
}
