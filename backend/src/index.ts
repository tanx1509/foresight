import express from "express";
import cors from "cors";
import { 
  runSignalAgent, 
  runHistorianAgent, 
  runAuditorAgent, 
  runChallengerAgent, 
  runSynthesizerAgent 
} from "./agents";
import { DecisionRecord } from "@foresight/shared";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// In-memory store for demo
const decisionRecords: DecisionRecord[] = [];
const DB_FILE = path.join(__dirname, "../../decision_records.json");

// Save records to disk for persistence
const saveRecords = () => {
  fs.writeFileSync(DB_FILE, JSON.stringify(decisionRecords, null, 2));
};

// Start Simulation Endpoint
app.post("/api/simulate", async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // In a real app, we'd use Server-Sent Events (SSE) or WebSockets to stream agent progress.
    // For this MVP, since we want to show the timeline on the frontend, we will just return the final result
    // and let the frontend simulate the timeline visually, OR we could build an SSE endpoint.
    // Let's stick to a single JSON response for simplicity, and the frontend can orchestrate the "timeline".
    
    // Actually, running them sequentially/concurrently here
    const context = await runSignalAgent(prompt);
    const docs = await runHistorianAgent(context);
    const constraints = await runAuditorAgent();
    const assumptions = await runChallengerAgent(context, docs);
    const simulation = await runSynthesizerAgent(context, docs, constraints, assumptions);

    res.json(simulation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Simulation failed" });
  }
});

// For an interactive timeline, we can expose individual agent endpoints
app.post("/api/agents/signal", async (req, res) => {
  const context = await runSignalAgent(req.body.prompt);
  res.json(context);
});

app.post("/api/agents/historian", async (req, res) => {
  const docs = await runHistorianAgent(req.body.context);
  res.json(docs);
});

app.post("/api/agents/auditor", async (req, res) => {
  const constraints = await runAuditorAgent();
  res.json(constraints);
});

app.post("/api/agents/challenger", async (req, res) => {
  const assumptions = await runChallengerAgent(req.body.context, req.body.docs);
  res.json(assumptions);
});

app.post("/api/agents/synthesizer", async (req, res) => {
  const { context, docs, constraints, assumptions } = req.body;
  const simulation = await runSynthesizerAgent(context, docs, constraints, assumptions);
  res.json(simulation);
});

// Decision Endpoint
app.post("/api/decisions", (req, res) => {
  const { action, simulationData } = req.body;
  const record: DecisionRecord = {
    decisionId: `dec-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action,
    simulationData
  };
  decisionRecords.push(record);
  saveRecords();
  res.json({ success: true, record });
});

app.listen(PORT, () => {
  console.log(`FORESIGHT Backend running on http://localhost:${PORT}`);
});
