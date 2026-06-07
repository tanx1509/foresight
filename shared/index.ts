export interface Document {
  id: string;
  title: string;
  type: "postmortem" | "incident_report" | "retrospective" | "launch_review" | "executive_note";
  date: string;
  author: string;
  content: string;
  tags: string[];
  relevanceScore?: number;
}

export interface DocumentMetadata {
  id: string;
  title: string;
  sourcePath: string;
  documentType?: string;
  createdAt?: string;
  ingestedAt?: string;
  wordCount?: number;
}

export interface Chunk {
  id: string;
  documentId: string;
  text: string;
  position: number;
  title?: string;
  sourcePath?: string;
  heading?: string;
}

export interface IndexedChunk {
  chunk: Chunk;
  embedding: number[];
}


export interface DecisionContext {
  prompt: string;
  decisionType: string;
  secondaryDomain?: string;
  affectedTeams: string[];
  deadline: string;
  owner: string | { name: string, role: string };
  confidence: "Low" | "Medium" | "High";
  strategicTension?: { goalA: string, goalB: string, conflict: string };
}

export interface OperationalConstraint {
  category: "capacity" | "workload" | "metrics" | "delays";
  description: string;
  severity: "High" | "Medium" | "Low";
}

export interface CriticalAssumption {
  assumption: string;
  challenge: string;
  vulnerability?: string;
  contradictingEvidence?: string[];
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
  acceptanceCriteria?: string[];
  reasoning?: string;
  evidence?: { source: string; excerpt: string; }[];
  evidenceList?: { source: string; type: string; confidence: number; reason: string }[];
  assumptionsList?: string[];
  whyGenerated?: string[];
}

export interface AgentResponse<T> {
  data: T;
  reasoningTrace: string[];
}

export interface FailureSimulation {
  context: DecisionContext;
  scenarios: FailureScenario[];
  constraints: OperationalConstraint[];
  assumptions: CriticalAssumption[];
  retrievedDocuments: Document[];
  agentTraces: {
    SIGNAL: string[];
    HISTORIAN: string[];
    AUDITOR: string[];
    CHALLENGER: string[];
    SYNTHESIZER: string[];
  };
  rollbackPlan?: { trigger: string; actions: string[]; owner: string };
  confidenceBreakdown?: { historicalEvidence: number; capacityAnalysis: number; dependencyCoverage: number; dataQuality: number; overall: number };
  executiveTrust?: { score: string; reasons: string[] };
  options?: { title: string; description: string; riskScore: 'Low'|'Medium'|'High'|'Critical'; costScore: 'Low'|'Medium'|'High'; confidence: number; rank: number }[];
  decisionTrace?: { agent: string; description: string; items: string[] }[];
  recommendationRationale?: string[];
  strategicTension?: { goalA: string, goalB: string, conflict: string };
}

export interface DecisionRecord {
  scenarioId: string;
  generatedBy: string[];
  evidence: string[];
  constraints: string[];
  assumptions: string[];
  confidence: string;
  timestamp: string;
  azureWorkItemId?: number;
  azureWorkItemTitle?: string;
  azureWorkItemUrl?: string;
}

export interface ActionDecisionRecord {
  decisionId: string;
  timestamp: string;
  action: "Proceed" | "Delay" | "Request Review";
  status: "Investigation" | "Under Review" | "Approved" | "Execution Started" | "Blocked" | "Escalated" | "Resolved" | "Completed" | "Rejected";
  reviewTicket?: {
    id: string;
    assignedTo: string;
    dueDate: string;
  };
  outcome?: {
    result: "Successful" | "Failed" | "Partially Successful";
    deploymentSuccess: number;
    incidents: number;
    lessonsLearned: string;
  };
  timeline?: { phase: string; title: string; description: string }[];
  approvalChain?: { role: string; status: string }[];
  simulationData: FailureSimulation;
}
