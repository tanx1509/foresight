import { chunkDocument, Chunk } from "./chunking";

export interface IngestedDocument {
  documentId: string;
  rawContent: string;
  chunks: Chunk[];
  ingestedAt: string;
}

export async function ingestDocument(rawText: string): Promise<IngestedDocument> {
  console.log("Extracting raw text...");
  console.log("Running chunking engine...");
  
  const chunks = chunkDocument(rawText);
  
  console.log(`Produced ${chunks.length} chunks.`);

  return {
    documentId: `doc-${Date.now()}`,
    rawContent: rawText,
    chunks,
    ingestedAt: new Date().toISOString()
  };
}
