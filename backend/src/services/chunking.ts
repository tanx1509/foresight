import { Chunk, DocumentMetadata } from "@foresight/shared";

export function chunkDocument(
  rawText: string, 
  metadata: DocumentMetadata,
  minLength: number = 300, 
  maxLength: number = 500
): Chunk[] {
  const lines = rawText.split('\n');
  const chunks: Chunk[] = [];
  let currentChunkText = "";
  let currentPosition = 0;
  let currentHeading = metadata.title || "General";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Heading heuristic: Short line, no trailing punctuation
    if (trimmed.length < 80 && !/[.!?]$/.test(trimmed)) {
      currentHeading = trimmed;
      continue;
    }

    const sentences = trimmed.match(/[^.!?]+[.!?]+(?:\s+|$)/g) || [trimmed];
    
    for (const sentence of sentences) {
      if (currentChunkText.length + sentence.length > maxLength && currentChunkText.length >= minLength) {
        chunks.push({
          id: `chunk-${metadata.id}-${currentPosition}`,
          documentId: metadata.id,
          text: `[${currentHeading}] ${currentChunkText.trim()}`,
          position: currentPosition,
          title: metadata.title,
          sourcePath: metadata.sourcePath,
          heading: currentHeading
        });
        currentPosition++;
        currentChunkText = sentence.trim();
      } else {
        currentChunkText += (currentChunkText ? ' ' : '') + sentence.trim();
      }
    }
  }

  if (currentChunkText.trim().length > 0) {
    chunks.push({
      id: `chunk-${metadata.id}-${currentPosition}`,
      documentId: metadata.id,
      text: `[${currentHeading}] ${currentChunkText.trim()}`,
      position: currentPosition,
      title: metadata.title,
      sourcePath: metadata.sourcePath,
      heading: currentHeading
    });
  }

  return chunks;
}
