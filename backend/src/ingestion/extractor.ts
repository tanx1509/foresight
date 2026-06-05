import path from 'path';
import { extractPdf } from './pdfExtractor';
import { extractDocx } from './docxExtractor';
import { extractTxt } from './txtExtractor';

export async function extractDocument(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case '.pdf':
      return extractPdf(filePath);
    case '.docx':
      return extractDocx(filePath);
    case '.txt':
      return extractTxt(filePath);
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}
