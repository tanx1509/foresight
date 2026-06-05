export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
}

export class MockEmbeddingProvider implements EmbeddingProvider {
  async generateEmbedding(text: string): Promise<number[]> {
    // Generate a mock 1536-dimensional embedding vector
    return new Array(1536).fill(0).map(() => Math.random() * 0.1);
  }
}

export class AzureOpenAIEmbeddingProvider implements EmbeddingProvider {
  async generateEmbedding(text: string): Promise<number[]> {
    throw new Error("Not implemented: AzureOpenAIEmbeddingProvider requires Phase 3 Azure keys.");
  }
}
