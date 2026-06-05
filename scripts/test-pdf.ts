import fs from 'fs';
const buffer = fs.readFileSync('./data/corpus/sample.pdf');

async function test() {
  const mod = await import('pdf-parse');
  const pdfParse = mod.default || mod;
  if (typeof pdfParse === 'function') {
    const data = await pdfParse(buffer);
    console.log("Dynamically imported default works:", data.text);
  } else {
    console.log("Still an object:", Object.keys(pdfParse));
  }
}
test();
