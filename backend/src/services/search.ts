import { allDocuments } from "@foresight/mock-data";

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
