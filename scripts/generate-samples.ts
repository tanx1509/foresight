import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun } from 'docx';

const CORPUS_DIR = path.resolve(process.cwd(), 'data/corpus');

async function generate() {
  if (!fs.existsSync(CORPUS_DIR)) fs.mkdirSync(CORPUS_DIR, { recursive: true });

  // 1. TXT
  fs.writeFileSync(
    path.join(CORPUS_DIR, 'sample.txt'),
    "This is a sample text document discussing the payment gateway timeout. We experienced severe delays due to a cascading failure."
  );

  // 2. PDF
  const pdfPath = path.join(CORPUS_DIR, 'sample.pdf');
  const execSync = require('child_process').execSync;
  execSync(`textutil -convert pdf -output "${pdfPath}" "${path.join(CORPUS_DIR, 'sample.txt')}"`);

  // 3. DOCX
  const docxDoc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun("SSO Certificate Rotation")],
        }),
        new Paragraph({
          children: [new TextRun("The SSO certificate rotation failed, causing a massive outage in the production environment.")],
        })
      ],
    }],
  });
  const buffer = await Packer.toBuffer(docxDoc);
  fs.writeFileSync(path.join(CORPUS_DIR, 'sample.docx'), buffer);

  console.log("Samples generated successfully in data/corpus.");
}

generate().catch(console.error);
