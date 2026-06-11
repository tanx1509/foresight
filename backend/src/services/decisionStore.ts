import fs from "fs";
import os from "os";
import path from "path";

const DATA_ROOT = process.env.DATA_DIR || (process.env.VERCEL ? path.join(os.tmpdir(), "foresight") : process.cwd());

const FILE_PATH = path.join(
  DATA_ROOT,
  "data",
  "decisionRecords.json"
);

export function loadDecisionRecords() {
  try {
    const raw = fs.readFileSync(FILE_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDecisionRecords(records: any[]) {
  const existing = loadDecisionRecords();
  fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });
  fs.writeFileSync(
    FILE_PATH,
    JSON.stringify(
      [...existing, ...records],
      null,
      2
    )
  );
}

export function updateDecisionRecord(decisionId: string, updates: any) {
  const existing = loadDecisionRecords();
  const index = existing.findIndex((r: any) => r.decisionId === decisionId);
  if (index !== -1) {
    existing[index] = { ...existing[index], ...updates };
    fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });
    fs.writeFileSync(FILE_PATH, JSON.stringify(existing, null, 2));
    return existing[index];
  }
  return null;
}
