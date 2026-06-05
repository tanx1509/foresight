import fs from 'fs';
import path from 'path';
import { IndexedChunk } from '@foresight/shared';

const INDEX_FILE = path.resolve(__dirname, '../../../data/index/index.json');

export class LocalSearchIndex {
  private chunks: IndexedChunk[] = [];

  constructor() {
    this.load();
  }

  add(chunk: IndexedChunk) {
    this.chunks.push(chunk);
  }

  save() {
    fs.writeFileSync(INDEX_FILE, JSON.stringify(this.chunks, null, 2));
  }

  load() {
    if (fs.existsSync(INDEX_FILE)) {
      this.chunks = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
    }
  }

  isPopulated() {
    return this.chunks.length > 0;
  }

  getAllChunks() {
    return this.chunks;
  }

  search(queryEmbedding: number[], queryTokens: string[], idf: Record<string, number>, topK: number) {
    const scored = this.chunks.map(c => {
      // 1. Cosine similarity
      let dotProduct = 0;
      for (let i = 0; i < 1536; i++) {
        dotProduct += queryEmbedding[i] * c.embedding[i];
      }
      const cosineSim = Math.max(0, dotProduct);

      // 2. TF-IDF
      let tfidfScore = 0;
      const docText = `${c.chunk.title || ''} ${c.chunk.heading || ''} ${c.chunk.text}`.toLowerCase();
      queryTokens.forEach(token => {
        const matches = docText.match(new RegExp(token, 'g'));
        const tf = matches ? matches.length : 0;
        tfidfScore += tf * (idf[token] || 0);
      });

      // Hybrid Retrieval
      const finalScore = (0.6 * cosineSim) + (0.4 * tfidfScore);

      return {
        chunk: c.chunk,
        score: finalScore
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}
