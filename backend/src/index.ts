import { createWorkItem } from "./services/azureDevops";
import { saveDecisionRecords, loadDecisionRecords } from "./services/decisionStore";
import { runSimulationWorkflow } from "./services/simulator";
import { handleTeamsMessage } from "./teams/bot";
import { getActivity, initializeActivity } from "./teams/activityStore";
import { getSimulation } from "./teams/simulationStore";
import { buildFailureMapCard } from "./teams/cards/failureMap";
import { saveDecisionRecord, getDecisionRecord, DecisionRecord } from "./teams/decisionStore";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { 
  runSignalAgent, 
  runHistorianAgent, 
  runAuditorAgent, 
  runChallengerAgent, 
  runSynthesizerAgent 
} from "./agents";
import { ActionDecisionRecord, FailureSimulation } from "@foresight/shared";
import fs from "fs";
import os from "os";
import path from "path";

const DATA_ROOT = process.env.DATA_DIR || (process.env.VERCEL ? path.join(os.tmpdir(), "foresight") : process.cwd());

// Bootstrap local storage directories
const BOOTSTRAP_DIRS = [
  "data/corpus",
  "data/processed",
  "data/chunks",
  "data/embeddings",
  "data/index",
  "data/operational"
];
BOOTSTRAP_DIRS.forEach(dir => {
  const fullPath = path.resolve(DATA_ROOT, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`[BOOTSTRAP] Created directory: ${dir}`);
  }
});

import { ingestCorpus } from "./ingestion/corpusIngestion";
import { getSearchProvider } from "./services/providerFactory";
import { getIntegrationStatuses, testIntegration, IntegrationId } from "./services/integrations";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/reindex", async (req, res) => {
  try {
    const result = await ingestCorpus();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/debug/search", async (req, res) => {
  try {
    const q = req.query.q as string;
    if (!q) return res.status(400).json({ error: "Missing query 'q'" });
    const searchProvider = getSearchProvider();
    const results = await searchProvider.search(q, 5);
    res.json({
      query: q,
      results: results.map((r: any) => r.title),
      scores: results.map((r: any) => r.score),
      retrievalMethod: "Hybrid (Cosine + TFIDF)"
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/simulate", async (req, res) => {
  try {
    const { prompt } = req.body;
    const decisionId = `sim-${Date.now()}`;
    initializeActivity(decisionId, ["SIGNAL", "HISTORIAN", "AUDITOR", "CHALLENGER", "SYNTHESIZER"]);
    const result = await runSimulationWorkflow(prompt, decisionId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Simulation failed" });
  }
});

app.post("/api/teams/message", async (req, res) => {
  try {
    const result = await handleTeamsMessage(req.body);
    if (result.status === "error") {
      res.status(500).json({ error: "Teams simulation failed" });
    } else if (result.status === "ignored") {
      res.status(200).json({ message: "Ignored" });
    } else {
      res.json(result.response);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/teams/activity/:decisionId", (req, res) => {
  const feed = getActivity(req.params.decisionId);
  if (!feed) {
    return res.status(404).json({ error: "Activity not found" });
  }
  res.json(feed);
});

app.get("/api/teams/activity", (req, res) => {
  const feed = require("./teams/activityStore").getLatestActivity();
  if (!feed) {
    return res.status(404).json({ error: "No activity found" });
  }
  res.json(feed);
});

app.get("/api/teams/failure-map/:decisionId", (req, res) => {
  const simulation = getSimulation(req.params.decisionId);
  if (!simulation) {
    return res.status(404).json({ error: "Simulation not found" });
  }
  res.json({
    decisionId: req.params.decisionId,
    card: buildFailureMapCard(simulation, req.params.decisionId)
  });
});

app.post("/api/teams/action", (req, res) => {
  const { decisionId, action } = req.body;
  
  const simulation = getSimulation(decisionId);
  if (!simulation) {
    return res.status(404).json({ error: "Simulation not found" });
  }

  let status: "APPROVED" | "UNDER_REVIEW" | "DELAYED" = "UNDER_REVIEW";
  if (action === "acknowledgeAndProceed") status = "APPROVED";
  else if (action === "delayDecision") status = "DELAYED";
  else if (action === "requestReview") status = "UNDER_REVIEW";

  const azureWorkItems = simulation.azureWorkItems?.map((wi: any) => wi.id) || [];
  const scenarioCount = simulation.scenarios?.length || 0;
  const acknowledgedScenarios = simulation.scenarios?.map((s: any) => s.id) || [];

  const record: DecisionRecord = {
    decisionId,
    decisionText: simulation.context?.decisionType || "Unknown Decision",
    action,
    status,
    timestamp: new Date().toISOString(),
    scenarioCount,
    acknowledgedScenarios,
    azureWorkItems
  };

  saveDecisionRecord(record);

  res.json({
    success: true,
    decisionRecord: record
  });
});

app.get("/api/teams/decision-record/:decisionId", (req, res) => {
  const record = getDecisionRecord(req.params.decisionId);
  if (!record) {
    return res.status(404).json({ error: "Decision record not found" });
  }
  res.json(record);
});

app.post("/api/decisions", (req, res) => {
  const { action, simulationData } = req.body;
  const existing = loadDecisionRecords();
  const decisionId = `dec-${Date.now()}`;
  
  let status: any = "Investigation";
  let reviewTicket = undefined;

  const decisionType = simulationData?.context?.decisionType || "Unknown";
  let timeline = [
    { phase: "Week 1", title: "Infrastructure Preparation", description: "Provisioning resources and validating rollback procedures." },
    { phase: "Week 2", title: "Pilot Deployment", description: "Initial rollout to 10% of traffic on non-critical endpoints." },
    { phase: "Week 3", title: "Validation & Tuning", description: "Evaluating success metrics against baseline capacity." },
    { phase: "Week 4", title: "Full Production Cutover", description: "100% traffic migration and legacy system deprecation." }
  ];
  let approvalChain = [
    { role: "Platform Owner", status: "Approved" },
    { role: "Engineering Director", status: "Pending Review" }
  ];

  if (decisionType === "Identity Migration") {
    timeline = [
      { phase: "Phase 1", title: "Discovery & Auditing", description: "Audit all legacy IdP dependencies and hardcoded certs." },
      { phase: "Phase 2", title: "Pilot Federation", description: "Federate Identity for IT and Security teams." },
      { phase: "Phase 3", title: "Scale Federation", description: "Migrate Engineering, Product, and Sales." },
      { phase: "Phase 4", title: "Legacy Deprecation", description: "Turn off Okta sync and invalidate old tokens." }
    ];
    approvalChain = [
      { role: "Identity Lead", status: "Approved" },
      { role: "Security Director", status: "Pending Review" },
      { role: "CIO", status: "Pending Review" }
    ];
  } else if (decisionType === "Frontend Rewrite") {
    timeline = [
      { phase: "Phase 1", title: "Component Rewrite", description: "Migrate 100 core components to new framework." },
      { phase: "Phase 2", title: "QA Regression", description: "Execute visual regression and end-to-end tests." },
      { phase: "Phase 3", title: "Beta Rollout", description: "Expose new UI to 5% of external beta customers." },
      { phase: "Phase 4", title: "Production Cutover", description: "Full traffic route flip to new frontend." }
    ];
    approvalChain = [
      { role: "Frontend Director", status: "Approved" },
      { role: "VP Product", status: "Pending Review" },
      { role: "CTO", status: "Pending Review" }
    ];
  } else if (decisionType === "Observability Migration") {
    timeline = [
      { phase: "Phase 1", title: "Dashboard Migration", description: "Translate syntax for top 50 critical dashboards." },
      { phase: "Phase 2", title: "Alert Validation", description: "Run dual alerting systems and diff PagerDuty noisy alerts." },
      { phase: "Phase 3", title: "Shadow Monitoring", description: "SRE team on-call using solely new observability stack." },
      { phase: "Phase 4", title: "Cutover", description: "Deprecate Datadog agent and drop ingestion." }
    ];
    approvalChain = [
      { role: "SRE Manager", status: "Approved" },
      { role: "Platform Director", status: "Pending Review" },
      { role: "CTO", status: "Pending Review" }
    ];
  } else if (decisionType === "Database Migration") {
    timeline = [
      { phase: "Phase 1", title: "Schema Translation", description: "Map SQL types and establish logical replication slots." },
      { phase: "Phase 2", title: "Initial Bulk Sync", description: "Stream historical data into CockroachDB over weekend." },
      { phase: "Phase 3", title: "Dual Write Phase", description: "Application layer writes to both DBs simultaneously." },
      { phase: "Phase 4", title: "Read Flip & Deprecation", description: "Promote new DB to primary and sever legacy replication." }
    ];
    approvalChain = [
      { role: "Principal Data Engineer", status: "Approved" },
      { role: "VP Engineering", status: "Pending Review" }
    ];
  } else if (decisionType === "Pricing Model Launch" || decisionType === "Product Monetization" || decisionType === "SMB Pricing Launch" || decisionType === "Enterprise Pricing Launch") {
    timeline = [
      { phase: "Phase 1", title: "Cohort Segregation", description: "Tag legacy customers for grandfathering." },
      { phase: "Phase 2", title: "Billing Dry Run", description: "Simulate monthly invoice generation against new stripe products." },
      { phase: "Phase 3", title: "Marketing Announcement", description: "Email comms to existing and prospective pipeline." },
      { phase: "Phase 4", title: "Stripe Cutover", description: "Flip active pricing table and deprecate old SKUs." }
    ];
    
    if (decisionType === "Enterprise Pricing Launch") {
      approvalChain = [
        { role: "VP Enterprise Sales", status: "Approved" },
        { role: "VP Product", status: "Pending Review" },
        { role: "Chief Revenue Officer", status: "Pending Review" },
        { role: "CFO", status: "Pending Review" }
      ];
    } else if (decisionType === "SMB Pricing Launch") {
      approvalChain = [
        { role: "Director of Product Growth", status: "Approved" },
        { role: "VP Marketing", status: "Pending Review" },
        { role: "VP Product", status: "Pending Review" }
      ];
    } else {
      approvalChain = [
        { role: "Director of Pricing", status: "Approved" },
        { role: "VP Product", status: "Pending Review" },
        { role: "CFO", status: "Pending Review" },
        { role: "VP Sales", status: "Pending Review" }
      ];
    }
  } else if (decisionType === "Revenue Operations Change" || decisionType === "CRM Migration" || decisionType === "Salesforce Rollout") {
    timeline = [
      { phase: "Phase 1", title: "Data Mapping", description: "Map custom objects, fields, and workflow rules." },
      { phase: "Phase 2", title: "Sandbox Testing", description: "Validate lead routing and CPQ generation in sandbox." },
      { phase: "Phase 3", title: "Sales Enablement", description: "Train 500+ AEs and SDRs on the new workflow." },
      { phase: "Phase 4", title: "Go-Live", description: "Data lock legacy system and switch over." }
    ];
    approvalChain = [
      { role: "VP Revenue Operations", status: "Approved" },
      { role: "Chief Revenue Officer", status: "Pending Review" },
      { role: "VP Engineering", status: "Pending Review" }
    ];
  } else if (decisionType === "Payment Gateway Migration") {
    timeline = [
      { phase: "Phase 1", title: "Provider Integration", description: "Implement new SDKs and webhook listeners." },
      { phase: "Phase 2", title: "Token Translation", description: "Securely migrate vaulted credit card tokens via PCI proxy." },
      { phase: "Phase 3", title: "Shadow Routing", description: "Route 5% of transactions to new provider." },
      { phase: "Phase 4", title: "Full Cutover", description: "Route 100% of transactions and deprecate legacy provider." }
    ];
    approvalChain = [
      { role: "Principal FinTech Engineer", status: "Approved" },
      { role: "Director of Platform", status: "Pending Review" },
      { role: "CFO", status: "Pending Review" }
    ];
  } else if (decisionType === "Compliance Initiative" || decisionType === "Security Policy Change") {
    timeline = [
      { phase: "Phase 1", title: "Gap Assessment", description: "Identify technical and policy gaps against SOC2/GDPR frameworks." },
      { phase: "Phase 2", title: "Remediation", description: "Implement missing controls and audit logging." },
      { phase: "Phase 3", title: "Internal Audit", description: "Conduct dry-run audit with internal compliance team." },
      { phase: "Phase 4", title: "External Audit", description: "Engage external auditor for formal certification." }
    ];
    approvalChain = [
      { role: "CISO", status: "Approved" },
      { role: "General Counsel", status: "Pending Review" },
      { role: "CTO", status: "Pending Review" }
    ];
  } else if (decisionType === "Market Expansion") {
    timeline = [
      { phase: "Phase 1", title: "Localization", description: "Translate UI, documentation, and support materials." },
      { phase: "Phase 2", title: "Legal Clearance", description: "Secure regulatory and data privacy approvals." },
      { phase: "Phase 3", title: "Soft Launch", description: "Invite-only beta for regional partners." },
      { phase: "Phase 4", title: "General Availability", description: "Full marketing launch in target region." }
    ];
    approvalChain = [
      { role: "VP International Expansion", status: "Approved" },
      { role: "Chief Marketing Officer", status: "Pending Review" },
      { role: "General Counsel", status: "Pending Review" }
    ];
  }

  if (action === "Proceed") {
    status = "Approved";
    // Auto-approve the first pending role
    const firstPending = approvalChain.find(a => a.status === "Pending Review");
    if (firstPending) firstPending.status = "Approved";
  } else if (action === "Request Review") {
    status = "Under Review";
    const assignedRole = approvalChain.find(a => a.status === "Pending Review")?.role || "Director";
    reviewTicket = {
      id: `REV-${Math.floor(Math.random() * 900) + 100}`,
      assignedTo: assignedRole,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    };
  } else if (action === "Delay") {
    status = "Rejected";
  }

  const record: ActionDecisionRecord = {
    decisionId,
    timestamp: new Date().toISOString(),
    action,
    status,
    reviewTicket,
    timeline,
    approvalChain,
    simulationData
  };
  saveDecisionRecords([record]);
  res.json({ success: true, record });
});

app.put("/api/decisions/:id/status", (req, res) => {
  const { status, outcome } = req.body;
  const { updateDecisionRecord } = require("./services/decisionStore");
  const updated = updateDecisionRecord(req.params.id, { status, ...(outcome && { outcome }) });
  if (updated) {
    res.json({ success: true, record: updated });
  } else {
    res.status(404).json({ success: false, error: "Not found" });
  }
});

app.get("/api/decision-history", (req, res) => {
  res.json(loadDecisionRecords());
});

app.post("/api/copilot/simulate", async (req, res) => {
  try {
    const prompt = req.body.prompt || req.body.message || req.body.text;
    if (!prompt) return res.status(400).json({ error: "Missing prompt, message, or text" });

    const decisionId = `copilot-${Date.now()}`;
    initializeActivity(decisionId, ["SIGNAL", "HISTORIAN", "AUDITOR", "CHALLENGER", "SYNTHESIZER"]);
    const result = await runSimulationWorkflow(prompt, decisionId);

    res.json({
      decisionId,
      summary: {
        decisionType: result.context?.decisionType,
        confidence: result.confidenceBreakdown?.overall,
        topRisk: result.scenarios?.[0]?.title,
        recommendedPath: result.options?.[0]?.title
      },
      simulation: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Copilot simulation failed" });
  }
});

app.post("/api/sharechat/message", async (req, res) => {
  try {
    const prompt = req.body.prompt || req.body.message || req.body.text;
    if (!prompt) return res.status(400).json({ error: "Missing prompt, message, or text" });

    const decisionId = `sharechat-${Date.now()}`;
    initializeActivity(decisionId, ["SIGNAL", "HISTORIAN", "AUDITOR", "CHALLENGER", "SYNTHESIZER"]);
    const result = await runSimulationWorkflow(prompt, decisionId);

    res.json({
      decisionId,
      message: `FORESIGHT completed ${result.context?.decisionType || "decision"} simulation. Top risk: ${result.scenarios?.[0]?.title || "review required"}.`,
      simulation: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "ShareChat simulation failed" });
  }
});

app.get("/api/integrations", (_req, res) => {
  res.json({
    appUrl: process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    apiUrl: process.env.PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    integrations: getIntegrationStatuses()
  });
});

app.post("/api/integrations/:id/test", async (req, res) => {
  try {
    const id = req.params.id as IntegrationId;
    if (!["azure", "teams", "copilot", "sharechat"].includes(id)) {
      return res.status(404).json({ error: "Unknown integration" });
    }

    const result = await testIntegration(id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Integration test failed" });
  }
});

export default app;

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`FORESIGHT Backend Phase 7B running on http://localhost:${PORT}`);
    console.log(`Runtime Configuration check:`);
    console.log(`> SEARCH_PROVIDER: ${process.env.SEARCH_PROVIDER || 'mock'}`);
    console.log(`> OPERATIONAL_PROVIDER: ${process.env.OPERATIONAL_PROVIDER || 'mock'}`);
  });
}
