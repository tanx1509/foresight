import fs from 'fs';
const pdfParse = require('pdf-parse');

export async function extractPdf(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  // Normalize spacing and newlines
  return data.text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
