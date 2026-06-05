import { SearchProvider, SearchResult } from "../services/search";

export class AzureSearchProvider implements SearchProvider {
  async search(query: string, topK: number): Promise<SearchResult[]> {
    throw new Error("Not implemented: AzureSearchProvider is scheduled for Phase 3.");
  }
}
