import { ingestCorpus } from '../src/ingestion/corpusIngestion';

async function seed() {
  console.log("Starting FORESIGHT Corpus Ingestion...");
  const result = await ingestCorpus();
  console.log("Ingestion Complete:");
  console.log(`- Documents Indexed: ${result.indexedDocuments}`);
  console.log(`- Documents Skipped: ${result.skippedDocuments}`);
  console.log(`- Chunks Generated:  ${result.indexedChunks}`);
  console.log(`- Duration:          ${result.durationSeconds.toFixed(2)}s`);
}

seed().catch(console.error);
