export interface DecisionRecord {
  decisionId: string;
  decisionText: string;
  action: string;
  status: "APPROVED" | "UNDER_REVIEW" | "DELAYED";
  timestamp: string;
  scenarioCount: number;
  acknowledgedScenarios: string[];
  azureWorkItems: number[];
}

const decisionStore = new Map<string, DecisionRecord>();

export function saveDecisionRecord(record: DecisionRecord) {
  decisionStore.set(record.decisionId, record);
}

export function getDecisionRecord(decisionId: string): DecisionRecord | undefined {
  return decisionStore.get(decisionId);
}

export function getAllDecisionRecords(): DecisionRecord[] {
  return Array.from(decisionStore.values());
}

export function updateDecisionRecord(decisionId: string, updates: Partial<DecisionRecord>) {
  const existing = decisionStore.get(decisionId);
  if (existing) {
    decisionStore.set(decisionId, { ...existing, ...updates });
  }
}
