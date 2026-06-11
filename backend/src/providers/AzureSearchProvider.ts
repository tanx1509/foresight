import { SearchProvider, SearchResult } from "../services/search";
import axios from "axios";

export class AzureSearchProvider implements SearchProvider {
  async search(query: string, topK: number): Promise<SearchResult[]> {
    const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
    const apiKey = process.env.AZURE_SEARCH_KEY;
    const indexName = process.env.AZURE_SEARCH_INDEX;
    const apiVersion = process.env.AZURE_SEARCH_API_VERSION || "2024-07-01";

    if (!endpoint || !apiKey || !indexName) {
      throw new Error("Missing Azure AI Search configuration: AZURE_SEARCH_ENDPOINT, AZURE_SEARCH_KEY, or AZURE_SEARCH_INDEX.");
    }

    const url = `${endpoint.replace(/\/$/, "")}/indexes/${encodeURIComponent(indexName)}/docs/search?api-version=${apiVersion}`;
    const response = await axios.post(
      url,
      {
        search: query,
        top: topK,
        queryType: "simple",
        searchMode: "any"
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json"
        }
      }
    );

    const docs = response.data.value || [];
    return docs.map((doc: any, index: number): SearchResult => ({
      id: String(doc.id || doc.chunk_id || doc.documentId || `azure-${index}`),
      title: String(doc.title || doc.heading || doc.name || "Azure Search Result"),
      content: String(doc.content || doc.text || doc.chunk || doc.description || ""),
      tags: Array.isArray(doc.tags) ? doc.tags : [],
      score: Number(doc["@search.score"] || 0),
      source: "azure-ai-search",
      metadata: {
        ...doc,
        "@search.score": undefined
      }
    }));
  }
}
