import mammoth from 'mammoth';

export async function extractDocx(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
