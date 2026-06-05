import fs from 'fs';

export async function extractTxt(filePath: string): Promise<string> {
  const text = fs.readFileSync(filePath, 'utf8');
  return text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
