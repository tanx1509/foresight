import { SearchProvider, MockSearchProvider } from "./search";
import { AzureSearchProvider } from "../providers/AzureSearchProvider";
import { SharePointProvider } from "../providers/SharePointProvider";

export function getSearchProvider(): SearchProvider {
  const providerType = process.env.SEARCH_PROVIDER || "mock";
  
  switch (providerType.toLowerCase()) {
    case "azure":
      return new AzureSearchProvider();
    case "sharepoint":
      return new SharePointProvider();
    case "mock":
    default:
      return new MockSearchProvider();
  }
}
