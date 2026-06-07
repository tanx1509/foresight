import fs from "fs";
import path from "path";

const FILE_PATH = path.join(
  process.cwd(),
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
    fs.writeFileSync(FILE_PATH, JSON.stringify(existing, null, 2));
    return existing[index];
  }
  return null;
}
