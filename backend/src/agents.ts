import { 
  DecisionContext, 
  FailureSimulation, 
  Document,
  CriticalAssumption,
  AgentResponse,
  FailureScenario
} from "@foresight/shared";
import { allDocuments, mockOperationalConstraints } from "@foresight/mock-data";
import { getSearchProvider } from "./services/providerFactory";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const runSignalAgent = async (prompt: string): Promise<AgentResponse<DecisionContext>> => {
  await delay(1000);
  const trace: string[] = [];
  
  const lowerPrompt = prompt.toLowerCase();
  let decisionType = "General Engineering Decision";
  let deadline = "TBD";
  let affectedTeams = ["Engineering"];
  
  trace.push(`Analyzing input: "${prompt}"`);

  if (lowerPrompt.includes("sso") || lowerPrompt.includes("migration") && !lowerPrompt.includes("crm")) {
    decisionType = "SSO Migration (SAML to OIDC)";
    affectedTeams = ["Identity", "DevOps", "All internal tooling users"];
    trace.push("Matched keywords: 'sso', 'migration' -> Extracted decisionType: 'SSO Migration'");
  } else if (lowerPrompt.includes("crm") || lowerPrompt.includes("salesforce")) {
    decisionType = "CRM Migration to Salesforce";
    affectedTeams = ["Sales", "Marketing", "Data Engineering"];
    trace.push("Matched keywords: 'crm', 'salesforce' -> Extracted decisionType: 'CRM Migration'");
  } else if (lowerPrompt.includes("payment") || lowerPrompt.includes("gateway")) {
    decisionType = "Payment Gateway Deployment";
    affectedTeams = ["Finance", "Checkout Team", "Platform"];
    trace.push("Matched keywords: 'payment', 'gateway' -> Extracted decisionType: 'Payment Gateway'");
  }

  if (lowerPrompt.includes("july 15")) {
    deadline = "July 15";
    trace.push("Matched date: 'July 15' -> Extracted deadline: 'July 15'");
  } else if (lowerPrompt.includes("next week")) {
    deadline = "Next Week";
    trace.push("Matched phrase: 'next week' -> Extracted deadline: 'Next Week'");
  }

  return {
    data: {
      decisionType,
      deadline,
      affectedTeams,
      owner: "System Extracted",
      confidence: "Medium"
    },
    reasoningTrace: trace
  };
};

export const runHistorianAgent = async (context: DecisionContext, prompt: string): Promise<AgentResponse<Document[]>> => {
  await delay(1500);
  const trace: string[] = [];
  trace.push("Initializing retrieval engine via providerFactory abstraction.");

  const searchProvider = getSearchProvider();
  const searchResults = await searchProvider.search(prompt, 5);

  const top5: Document[] = searchResults.map(res => ({
    id: res.id,
    title: res.title,
    content: res.content,
    tags: res.tags,
    relevanceScore: res.score,
    type: (res.metadata?.type as any) || "executive_note",
    date: res.metadata?.date || new Date().toISOString(),
    author: res.metadata?.author || "Unknown"
  }));

  trace.push(`SearchProvider returned top 5 results.`);
  top5.forEach((d, i) => trace.push(`Rank ${i+1}: ${d.title} (Score: ${d.relevanceScore})`));

  return { data: top5, reasoningTrace: trace };
};

export const runAuditorAgent = async (): Promise<AgentResponse<typeof mockOperationalConstraints>> => {
  await delay(1000);
  const trace = [
    "Connecting to mock metrics telemetry.",
    "Analyzing sprint capacity... Detected 30% reduction (Summer PTO).",
    "Analyzing DevOps workloads... Detected Kubernetes upgrade overlap.",
    "Checking DORA metrics... PR review times elevated."
  ];
  return { data: mockOperationalConstraints, reasoningTrace: trace };
};

export const runChallengerAgent = async (context: DecisionContext, docs: Document[]): Promise<AgentResponse<CriticalAssumption[]>> => {
  await delay(1500);
  const trace: string[] = [];
  const assumptions: CriticalAssumption[] = [];

  trace.push(`Routing assumption generation based on context: ${context.decisionType}`);

  if (context.decisionType.includes("SSO")) {
    assumptions.push({
      assumption: "Legacy microservices will not be broken by the authentication shift.",
      challenge: "Legacy dependencies are rarely fully audited before core infrastructure changes.",
      evidenceId: docs.find(d => d.content.toLowerCase().includes("legacy"))?.id
    });
    assumptions.push({
      assumption: "Internal identity providers have 100% uptime during transition.",
      challenge: "Identity provider migrations historically suffer partial outages.",
      evidenceId: docs.find(d => d.content.toLowerCase().includes("outage"))?.id
    });
    assumptions.push({
      assumption: "SSL certificates are completely updated across the routing layer.",
      challenge: "Load balancer TLS termination is often missed in automated renewal scripts.",
      evidenceId: docs.find(d => d.content.toLowerCase().includes("certificate"))?.id
    });
  } else if (context.decisionType.includes("CRM")) {
    assumptions.push({
      assumption: "Salesforce API limits will comfortably handle the initial data burst.",
      challenge: "Historical migrations show burst data mapping severely violates rate limits.",
      evidenceId: docs.find(d => d.content.toLowerCase().includes("vendor"))?.id
    });
    assumptions.push({
      assumption: "Data mapping schemas match exactly 1-to-1.",
      challenge: "OIDC/SAML structures or data schemas rarely align 1-to-1 without middleware.",
      evidenceId: docs.find(d => d.content.toLowerCase().includes("claims"))?.id
    });
    assumptions.push({
      assumption: "Customer data integrity will remain perfectly intact during transfer.",
      challenge: "Data corruption is common during large-scale bulk migrations.",
      evidenceId: docs.find(d => d.content.toLowerCase().includes("marketing"))?.id
    });
  } else if (context.decisionType.includes("Payment")) {
    assumptions.push({
      assumption: "The checkout process will not timeout during peak hours.",
      challenge: "Database locking causes latency cascades on new checkout systems.",
      evidenceId: docs.find(d => d.content.toLowerCase().includes("downtime"))?.id
    });
    assumptions.push({
      assumption: "Idempotency keys will prevent all transaction duplications.",
      challenge: "Client-side retries often bypass standard idempotency safeguards under load."
    });
    assumptions.push({
      assumption: "Availability of the third-party gateway is 99.99%.",
      challenge: "Third-party gateways often have unannounced maintenance windows."
    });
  } else {
    assumptions.push({
      assumption: "The migration can be completed without any unexpected edge cases.",
      challenge: "We lack sufficient testing data for edge cases."
    });
  }

  trace.push(`Generated ${assumptions.length} domain-specific assumptions.`);
  return { data: assumptions, reasoningTrace: trace };
};

export const runSynthesizerAgent = async (
  context: DecisionContext, 
  docs: Document[], 
  constraints: typeof mockOperationalConstraints, 
  assumptions: CriticalAssumption[]
): Promise<AgentResponse<FailureScenario[]>> => {
  await delay(2000);
  const trace: string[] = [];
  const scenarios: FailureScenario[] = [];

  trace.push(`Synthesizing scenarios routed by context: ${context.decisionType}`);

  // Base severity is modified by retrieved documents
  const docText = docs.map(d => d.content.toLowerCase()).join(" ");
  const hasOutageHistory = docText.includes("outage") || docText.includes("downtime");
  const hasVendorHistory = docText.includes("vendor") || docText.includes("claims");

  if (context.decisionType.includes("SSO")) {
    trace.push("Generating SSO specific scenario: Legacy Microservice Lockout");
    scenarios.push({
      id: `sso-1`,
      title: "Legacy Microservice Lockout",
      causalChain: [
        "Proceed with SSO migration",
        "Legacy v1 auth endpoints are bypassed",
        "15% of internal microservices fail to authenticate",
        "Cascading failure across internal tooling"
      ],
      supportingEvidenceIds: assumptions[0]?.evidenceId ? [assumptions[0].evidenceId] : [],
      impact: "Complete halt of internal operations for dependent teams.",
      severity: hasOutageHistory ? "Critical" : "High",
      mitigationRecommendations: ["Audit and update all v1 usages before deployment."]
    });
    
    trace.push("Generating SSO specific scenario: Identity Provider Outage");
    scenarios.push({
      id: `sso-2`,
      title: "Identity Provider Outage",
      causalChain: [
        "SAML to OIDC handoff initiates",
        "Unexpected token parsing error crashes identity routing",
        "Company-wide logout"
      ],
      supportingEvidenceIds: assumptions[1]?.evidenceId ? [assumptions[1].evidenceId] : [],
      impact: "All employees unable to access internal systems.",
      severity: "Critical",
      mitigationRecommendations: ["Implement a fallback 'break-glass' admin token."]
    });

    trace.push("Generating SSO specific scenario: Certificate Rotation Failure");
    scenarios.push({
      id: `sso-3`,
      title: "Certificate Rotation Failure",
      causalChain: [
        "New endpoints require updated TLS certificates",
        "Load balancer is misconfigured",
        "Secure connections rejected"
      ],
      supportingEvidenceIds: assumptions[2]?.evidenceId ? [assumptions[2].evidenceId] : [],
      impact: "Downtime during switch-over.",
      severity: "Medium",
      mitigationRecommendations: ["Perform a dry-run certificate rotation in staging."]
    });
  } else if (context.decisionType.includes("CRM")) {
    trace.push("Generating CRM specific scenario: Vendor API Data Mapping Failure");
    scenarios.push({
      id: `crm-1`,
      title: "Vendor API Data Mapping Failure",
      causalChain: [
        "Initiate CRM data transfer",
        "Custom field schema mismatch causes ingestion errors",
        "Salesforce rejects 30% of critical customer records"
      ],
      supportingEvidenceIds: assumptions[1]?.evidenceId ? [assumptions[1].evidenceId] : [],
      impact: "Loss of lead tracking and revenue data.",
      severity: hasVendorHistory ? "Critical" : "High",
      mitigationRecommendations: ["Pre-build a custom claims/data mapper middleware."]
    });

    trace.push("Generating CRM specific scenario: Salesforce Rate Limiting");
    scenarios.push({
      id: `crm-2`,
      title: "Salesforce Rate Limiting",
      causalChain: [
        "Bulk transfer hits API",
        "Salesforce API limits exceeded in first hour",
        "Migration script crashes and leaves data in partial state"
      ],
      supportingEvidenceIds: assumptions[0]?.evidenceId ? [assumptions[0].evidenceId] : [],
      impact: "Data synchronization locked for 24 hours.",
      severity: "High",
      mitigationRecommendations: ["Implement chunking and strict retry backoff logic."]
    });

    trace.push("Generating CRM specific scenario: Customer Data Corruption");
    scenarios.push({
      id: `crm-3`,
      title: "Customer Data Corruption",
      causalChain: [
        "Concurrent updates occur during migration",
        "Race condition corrupts recent contact logs",
        "Sales reps lose context on active deals"
      ],
      supportingEvidenceIds: assumptions[2]?.evidenceId ? [assumptions[2].evidenceId] : [],
      impact: "Customer trust degradation and lost sales.",
      severity: "Medium",
      mitigationRecommendations: ["Enforce a hard read-only freeze on old CRM during sync."]
    });
  } else if (context.decisionType.includes("Payment")) {
    trace.push("Generating Payment specific scenario: Payment Timeout Cascade");
    scenarios.push({
      id: `pay-1`,
      title: "Payment Timeout Cascade",
      causalChain: [
        "Deploy new payment gateway",
        "Peak hour load causes database locking",
        "Gateway latency spikes beyond 200ms",
        "Client retries exacerbate the load causing total crash"
      ],
      supportingEvidenceIds: assumptions[0]?.evidenceId ? [assumptions[0].evidenceId] : [],
      impact: "Total system unavailability preventing all revenue generation.",
      severity: hasOutageHistory ? "Critical" : "High",
      mitigationRecommendations: ["Scale database read replicas proactively."]
    });

    trace.push("Generating Payment specific scenario: Transaction Duplication");
    scenarios.push({
      id: `pay-2`,
      title: "Transaction Duplication",
      causalChain: [
        "Timeout occurs but transaction was authorized",
        "Idempotency keys fail across distributed nodes",
        "Users charged twice"
      ],
      supportingEvidenceIds: [],
      impact: "Severe brand damage and chargeback fees.",
      severity: "Critical",
      mitigationRecommendations: ["Audit idempotency key logic across all microservices."]
    });

    trace.push("Generating Payment specific scenario: Checkout Availability Failure");
    scenarios.push({
      id: `pay-3`,
      title: "Checkout Availability Failure",
      causalChain: [
        "Third-party vendor experiences maintenance",
        "Gateway integration fails to fallback gracefully",
        "Checkout page crashes"
      ],
      supportingEvidenceIds: [],
      impact: "Intermittent failures during the weekend.",
      severity: "Medium",
      mitigationRecommendations: ["Implement a circuit breaker with an alternative payment method."]
    });
  }

  // Common Constraint Scenario
  trace.push("Synthesizing Operational Constraint Scenario.");
  scenarios.push({
    id: `scenario-${Date.now()}-ops`,
    title: "Rollback Failure due to Resource Constraints",
    causalChain: [
      "Migration encounters critical issue",
      "Team attempts rollback",
      "Reduced capacity and concurrent DevOps workloads prevent rapid resolution"
    ],
    supportingEvidenceIds: [],
    impact: "Extended downtime beyond expected maintenance windows.",
    severity: "Medium",
    mitigationRecommendations: [
      "Freeze DevOps deployments during this timeframe.",
      "Ensure secondary on-call rotation is staffed."
    ]
  });

  return { data: scenarios, reasoningTrace: trace };
};
