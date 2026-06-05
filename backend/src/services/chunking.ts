export interface Chunk {
  chunkId: string;
  content: string;
  position: number;
}

export function chunkDocument(rawText: string, minLength: number = 300, maxLength: number = 500): Chunk[] {
  // Simple regex to split by sentences (period, exclamation, or question mark followed by space or newline)
  // Warning: This is a basic heuristic for a hackathon without external NLP libraries.
  const sentences = rawText.match(/[^.!?]+[.!?]+(?:\s+|$)/g) || [rawText];
  
  const chunks: Chunk[] = [];
  let currentChunkText = "";
  let currentPosition = 0;

  for (const sentence of sentences) {
    if (currentChunkText.length + sentence.length > maxLength && currentChunkText.length >= minLength) {
      chunks.push({
        chunkId: `chunk-${Date.now()}-${currentPosition}`,
        content: currentChunkText.trim(),
        position: currentPosition
      });
      currentPosition++;
      currentChunkText = sentence;
    } else {
      currentChunkText += sentence;
    }
  }

  // Push the remainder
  if (currentChunkText.trim().length > 0) {
    chunks.push({
      chunkId: `chunk-${Date.now()}-${currentPosition}`,
      content: currentChunkText.trim(),
      position: currentPosition
    });
  }

  return chunks;
}
