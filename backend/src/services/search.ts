import { allDocuments } from "@foresight/mock-data";
import { LocalSearchIndex } from "../indexing/localIndex";
import { LocalEmbeddingProvider } from "./embeddings";


export interface SearchResult {
  id: string;
  title: string;
  content: string;
  tags: string[];
  score: number;
  source: string;
  metadata?: Record<string, any>;
}

export interface SearchProvider {
  search(query: string, topK: number): Promise<SearchResult[]>;
}

export class MockSearchProvider implements SearchProvider {
  async search(query: string, topK: number): Promise<SearchResult[]> {
    const tokens = query.toLowerCase().replace(/[^\w\s]/g, '').split(' ').filter(t => t.length > 2);
    
    const localIndex = new LocalSearchIndex();
    if (localIndex.isPopulated()) {
      const chunks = localIndex.getAllChunks();
      const N = chunks.length;
      const idf: Record<string, number> = {};
      tokens.forEach(token => {
        const docCount = chunks.filter(c => c.chunk.text.toLowerCase().includes(token)).length;
        idf[token] = Math.log((N + 1) / ((docCount || 0) + 1)) + 1;
      });

      const embedder = new LocalEmbeddingProvider();
      const queryEmbedding = await embedder.generateEmbedding(query);
      const results = localIndex.search(queryEmbedding, tokens, idf, topK);
      return results.map(r => ({
        id: r.chunk.id,
        title: r.chunk.heading || r.chunk.title || 'Untitled',
        content: r.chunk.text,
        tags: [],
        score: Number(r.score.toFixed(2)),
        source: "local-index",
        metadata: {
          type: "indexed_chunk",
          date: new Date().toISOString(),
          author: "Local Corpus",
          sourcePath: r.chunk.sourcePath
        }
      }));
    }

    // Fallback Mock Logic
    const N = allDocuments.length;
    const idf: Record<string, number> = {};
    
    tokens.forEach(token => {
      const docCount = allDocuments.filter(d => 
        d.content.toLowerCase().includes(token) || 
        d.title.toLowerCase().includes(token) ||
        d.tags.some(tag => tag.toLowerCase().includes(token))
      ).length;
      idf[token] = Math.log((N + 1) / ((docCount || 0) + 1)) + 1;
    });

    const scoredDocs = allDocuments.map(doc => {
      let score = 0;
      const docText = `${doc.title} ${doc.content} ${doc.tags.join(' ')}`.toLowerCase();
      
      tokens.forEach(token => {
        const matches = docText.match(new RegExp(token, 'g'));
        const tf = matches ? matches.length : 0;
        score += tf * (idf[token] || 0);
      });

      return { 
        id: doc.id,
        title: doc.title,
        content: doc.content,
        tags: doc.tags,
        score: Number(score.toFixed(2)),
        source: "mock-data",
        metadata: {
          type: doc.type,
          date: doc.date,
          author: doc.author
        }
      };
    });

    scoredDocs.sort((a, b) => b.score - a.score);
    return scoredDocs.slice(0, topK);
  }
}
