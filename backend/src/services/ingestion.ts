import { chunkDocument } from "./chunking";
import { Chunk, DocumentMetadata } from "@foresight/shared";

export interface IngestedDocument {
  documentId: string;
  rawContent: string;
  chunks: Chunk[];
  ingestedAt: string;
}

export async function ingestDocument(rawText: string): Promise<IngestedDocument> {
  console.log("Extracting raw text...");
  console.log("Running chunking engine...");
  
  const dummyMeta: DocumentMetadata = { id: "legacy", title: "legacy", sourcePath: "legacy" };
  const chunks = chunkDocument(rawText, dummyMeta);
  
  console.log(`Produced ${chunks.length} chunks.`);

  return {
    documentId: `doc-${Date.now()}`,
    rawContent: rawText,
    chunks,
    ingestedAt: new Date().toISOString()
  };
}
