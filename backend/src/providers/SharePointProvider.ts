import { SearchProvider, SearchResult } from "../services/search";

export class SharePointProvider implements SearchProvider {
  async search(query: string, topK: number): Promise<SearchResult[]> {
    throw new Error("Not implemented: SharePointProvider is scheduled for Phase 3.");
  }
}
