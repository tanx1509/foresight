import { 
  DecisionContext, 
  FailureSimulation, 
  Document,
  CriticalAssumption
} from "@foresight/shared";
import { allDocuments, mockOperationalConstraints } from "@foresight/mock-data";

// Simulated delay to make the UI feel like an AI is thinking
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const runSignalAgent = async (prompt: string): Promise<DecisionContext> => {
  await delay(1500); // simulate thinking
  return {
    decisionType: "SSO Migration (SAML to OIDC)",
    deadline: "July 15",
    affectedTeams: ["Identity", "DevOps", "All internal tooling users"],
    owner: "Sarah Chen",
    confidence: "Medium"
  };
};

export const runHistorianAgent = async (context: DecisionContext): Promise<Document[]> => {
  await delay(2000);
  // In a real app, this would use embeddings/vector search. 
  // Here we deterministically return the 5 highly relevant docs from our mock data.
  return allDocuments.filter(doc => 
    doc.id === "doc-001" || doc.id === "doc-002" || doc.id === "doc-003" || doc.id === "doc-004" || doc.id === "doc-005"
  );
};

export const runAuditorAgent = async (): Promise<typeof mockOperationalConstraints> => {
  await delay(1500);
  return mockOperationalConstraints;
};

export const runChallengerAgent = async (context: DecisionContext, docs: Document[]): Promise<CriticalAssumption[]> => {
  await delay(1800);
  return [
    {
      assumption: "The migration can be completed in a single weekend window.",
      challenge: "Document doc-001 shows a previous identity migration took 4 hours of unexpected downtime due to legacy token bypass.",
      evidenceId: "doc-001"
    },
    {
      assumption: "All systems use the new SSO gateway.",
      challenge: "Executive Note doc-005 states 15% of microservices still hardcode v1 auth URLs.",
      evidenceId: "doc-005"
    },
    {
      assumption: "The external vendor OIDC claims will map 1:1 with our system.",
      challenge: "Launch Review doc-004 highlights a 3-week delay due to OIDC claim structure mismatch with a CRM vendor.",
      evidenceId: "doc-004"
    }
  ];
};

export const runSynthesizerAgent = async (
  context: DecisionContext, 
  docs: Document[], 
  constraints: typeof mockOperationalConstraints, 
  assumptions: CriticalAssumption[]
): Promise<FailureSimulation> => {
  await delay(2500);
  
  return {
    context,
    retrievedDocuments: docs,
    constraints,
    assumptions,
    scenarios: [
      {
        id: "scenario-1",
        title: "Legacy Microservice Lockout",
        causalChain: [
          "SSO migration completes over the weekend",
          "Legacy v1 auth endpoints are deprecated or ignored",
          "15% of internal microservices fail to authenticate",
          "Cascading failure across internal tooling"
        ],
        supportingEvidenceIds: ["doc-001", "doc-005"],
        impact: "Complete halt of internal operations for dependent teams for ~4-8 hours.",
        severity: "Critical",
        mitigationRecommendations: [
          "Audit and update all microservices using v1 auth URLs before July 15.",
          "Implement a fallback token exchange for legacy systems."
        ]
      },
      {
        id: "scenario-2",
        title: "Vendor OIDC Claim Mismatch Delay",
        causalChain: [
          "Migration proceeds with assumption of standard OIDC",
          "External integrations (e.g., CRM) reject the new claims",
          "Manual middleware required to map claims"
        ],
        supportingEvidenceIds: ["doc-004"],
        impact: "Migration timeline delayed by 2-3 weeks; external partners locked out.",
        severity: "High",
        mitigationRecommendations: [
          "Test claim structures with top 5 vendors in a staging environment this week.",
          "Pre-build a custom claims mapper middleware just in case."
        ]
      },
      {
        id: "scenario-3",
        title: "Rollback Failure due to Resource Constraints",
        causalChain: [
          "Migration encounters critical issue",
          "Team attempts rollback",
          "Reduced sprint capacity (PTO) and DevOps workload prevents rapid resolution"
        ],
        supportingEvidenceIds: [],
        impact: "Extended downtime extending into Monday business hours.",
        severity: "Medium",
        mitigationRecommendations: [
          "Freeze DevOps Kubernetes upgrade during the SSO migration weekend.",
          "Ensure secondary on-call rotation is staffed despite summer PTO."
        ]
      }
    ]
  };
};
