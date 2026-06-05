import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { extractDocument } from './extractor';
import { chunkDocument } from '../services/chunking';
import { LocalEmbeddingProvider } from '../services/embeddings';
import { LocalSearchIndex } from '../indexing/localIndex';
import { DocumentMetadata } from '@foresight/shared';

const CORPUS_DIR = path.resolve(__dirname, '../../../data/corpus');
const CHUNKS_DIR = path.resolve(__dirname, '../../../data/chunks');
const MANIFEST_FILE = path.resolve(__dirname, '../../../data/index/file-manifest.json');

export async function ingestCorpus() {
  const index = new LocalSearchIndex();
  const embedder = new LocalEmbeddingProvider();
  
  let manifest: Record<string, string> = {};
  if (fs.existsSync(MANIFEST_FILE)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  }

  let indexedDocuments = 0;
  let indexedChunks = 0;
  let skippedDocuments = 0;

  if (!fs.existsSync(CORPUS_DIR)) return { indexedDocuments: 0, indexedChunks: 0, skippedDocuments: 0, durationSeconds: 0 };
  
  const files = fs.readdirSync(CORPUS_DIR).filter(f => !f.startsWith('.'));
  const startTime = Date.now();

  for (const file of files) {
    const filePath = path.join(CORPUS_DIR, file);
    const contentBuffer = fs.readFileSync(filePath);
    const fileHash = crypto.createHash('md5').update(contentBuffer).digest('hex');

    if (manifest[file] === fileHash) {
      skippedDocuments++;
      continue;
    }

    try {
      const text = await extractDocument(filePath);
      const wordCount = text.split(/\s+/).length;

      const metadata: DocumentMetadata = {
        id: `doc-${crypto.randomBytes(4).toString('hex')}`,
        title: file,
        sourcePath: filePath,
        documentType: path.extname(file).replace('.', ''),
        createdAt: fs.statSync(filePath).birthtime.toISOString(),
        ingestedAt: new Date().toISOString(),
        wordCount
      };

      const chunks = chunkDocument(text, metadata);
      
      for (const chunk of chunks) {
        const embedding = await embedder.generateEmbedding(chunk.text);
        index.add({ chunk, embedding });
        fs.writeFileSync(path.join(CHUNKS_DIR, `${chunk.id}.json`), JSON.stringify({ chunk, embedding }, null, 2));
        indexedChunks++;
      }

      manifest[file] = fileHash;
      indexedDocuments++;
    } catch (err) {
      console.error(`Failed to ingest ${file}:`, err);
    }
  }

  if (indexedDocuments > 0) {
    index.save();
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  }

  const durationSeconds = (Date.now() - startTime) / 1000;
  return { indexedDocuments, indexedChunks, skippedDocuments, durationSeconds };
}
