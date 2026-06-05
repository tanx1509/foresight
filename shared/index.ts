export interface Document {
  id: string;
  title: string;
  type: "postmortem" | "incident_report" | "retrospective" | "launch_review" | "executive_note";
  date: string;
  author: string;
  content: string;
  tags: string[];
}

export interface DecisionContext {
  decisionType: string;
  deadline: string;
  affectedTeams: string[];
  owner: string;
  confidence: "High" | "Medium" | "Low";
}

export interface OperationalConstraint {
  category: "capacity" | "workload" | "metrics" | "delays";
  description: string;
  severity: "High" | "Medium" | "Low";
}

export interface CriticalAssumption {
  assumption: string;
  challenge: string;
  evidenceId?: string; // Link to a document
}

export interface FailureScenario {
  id: string;
  title: string;
  causalChain: string[];
  supportingEvidenceIds: string[];
  impact: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  mitigationRecommendations: string[];
}

export interface FailureSimulation {
  context: DecisionContext;
  scenarios: FailureScenario[];
  constraints: OperationalConstraint[];
  assumptions: CriticalAssumption[];
  retrievedDocuments: Document[];
}

export interface DecisionRecord {
  decisionId: string;
  timestamp: string;
  action: "Proceed" | "Delay" | "Request Review";
  simulationData: FailureSimulation;
}
